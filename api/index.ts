import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import compression from 'compression';
import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDB, query } from '../db';
import { authenticateToken, AuthRequest } from '../auth';

dotenv.config();

const startTime = Date.now();
console.log('[Server] Starting initialization in ESM mode...');

initDB();

// Secure OTP Storage with expiration (10 minutes)
const generateSecureOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// TextBee SMS Function
const sendSMS = async (to: string, message: string) => {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_SENDER_ID;
  
  if (!apiKey || !deviceId) {
    console.error('[TextBee] Missing API Key or Device ID');
    return false;
  }

  try {
    const response = await fetch('https://api.textbee.dev/api/v1/gateway/devices/send-sms', {
      method: 'POST',
      headers: { 
        'x-api-key': apiKey, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        receiver: to, 
        message: message, 
        deviceId: deviceId 
      }),
    });
    
    const data = await response.json();
    console.log('[TextBee] SMS Response:', data);
    return response.ok;
  } catch (error) {
    console.error('[TextBee] SMS Error:', error);
    return false;
  }
};

const app = express();

app.use(compression());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: Date.now() - startTime }));

// Error normalization helper
const sendError = (res: express.Response, message: string, status = 500) => {
  res.status(status).json({ error: message, success: false });
};

// POST /api/verify/init -> Envoie les OTP AVANT la création du compte
app.post('/api/verify/init', async (req, res) => {
  const { email, phone } = req.body;
  
  if (!email || !email.endsWith('@etu-usenghor.org')) {
    return sendError(res, "Email invalide ou domaine non autorisé.", 400);
  }
  if (!phone || !/^\+[1-9]\d{1,14}$/.test(phone)) {
    return sendError(res, "Format de téléphone invalide. Utilisez le format international (ex: +221...)", 400);
  }

  const emailOtp = generateSecureOTP();
  const phoneOtp = generateSecureOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

  try {
    // Store OTPs in database
    await query('DELETE FROM otps WHERE identifier = $1 OR identifier = $2', [`email:${email}`, `phone:${phone}`]);
    await query('INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)', [`email:${email}`, emailOtp, expiresAt]);
    await query('INSERT INTO otps (identifier, code, expires_at) VALUES ($1, $2, $3)', [`phone:${phone}`, phoneOtp, expiresAt]);

    // Send Email in background
    transporter.sendMail({
      from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Code de sécurité - Inscription',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Vérification de votre adresse email</h2>
          <p>Vous avez demandé à vous inscrire sur la Bourse du Temps.</p>
          <p>Voici votre code de sécurité à 6 chiffres (valable 10 minutes) :</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 32px; letter-spacing: 4px; color: #1f2937;">${emailOtp}</strong>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      `,
    }).catch((emailError: any) => {
      console.error('[Verify Init] Email failed to send:', emailError.message);
      if (emailError.message.includes('Application-specific password required')) {
        console.error('>>> ACTION REQUIRED: You must use a Google App Password for EMAIL_PASS, not your regular password. Go to https://myaccount.google.com/apppasswords to generate one.');
      }
      console.log(`[DEV MODE] Fallback - Email OTP for ${email}: ${emailOtp}`);
    });

    // Send SMS in background
    sendSMS(phone, `Bourse du Temps: Votre code de sécurité est ${phoneOtp}. Valable 10 min.`)
      .then(smsSent => {
        if (!smsSent) {
          console.warn("[TextBee] SMS failed to send.");
          console.log(`[DEV MODE] Fallback - Phone OTP for ${phone}: ${phoneOtp}`);
        }
      })
      .catch((smsError: any) => {
        console.error('[TextBee] SMS Error:', smsError.message);
        console.log(`[DEV MODE] Fallback - Phone OTP for ${phone}: ${phoneOtp}`);
      });

    res.json({ success: true, message: "Codes générés. Vérifiez vos messages ou la console du serveur." });
  } catch (error: any) {
    console.error('[Verify Init] Error:', error);
    sendError(res, "Erreur lors de la génération des codes de vérification.");
  }
});

// POST /api/verify/check -> Vérifie temporairement les codes côté client
app.post('/api/verify/check', async (req, res) => {
  const { email, phone, emailCode, phoneCode } = req.body;
  
  try {
    const emailResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`email:${email}`]);
    const phoneResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`phone:${phone}`]);

    const storedEmail = emailResult.rows[0];
    const storedPhone = phoneResult.rows[0];

    if (!storedEmail || storedEmail.code !== emailCode || new Date() > new Date(storedEmail.expires_at)) {
      return sendError(res, "Code email invalide ou expiré.", 400);
    }
    if (!storedPhone || storedPhone.code !== phoneCode || new Date() > new Date(storedPhone.expires_at)) {
      return sendError(res, "Code SMS invalide ou expiré.", 400);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Verify Check] Error:', error);
    sendError(res, "Erreur lors de la vérification des codes.");
  }
});

// POST /api/register -> Crée l'utilisateur UNIQUEMENT si les codes sont valides
app.post('/api/register', async (req, res) => {
  const { email, phone, emailCode, phoneCode, password, firstName, lastName, campus, department, gender, country, offeredSkills, requestedSkills, availability, languages, avatar } = req.body;
  
  try {
    // 1. STRICT SECURITY CHECK: Verify OTPs again before touching the database
    const emailResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`email:${email}`]);
    const phoneResult = await query('SELECT * FROM otps WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1', [`phone:${phone}`]);

    const storedEmail = emailResult.rows[0];
    const storedPhone = phoneResult.rows[0];

    if (!storedEmail || storedEmail.code !== emailCode || new Date() > new Date(storedEmail.expires_at)) {
      return sendError(res, "Échec de sécurité : Code email invalide ou expiré.", 403);
    }
    if (!storedPhone || storedPhone.code !== phoneCode || new Date() > new Date(storedPhone.expires_at)) {
      return sendError(res, "Échec de sécurité : Code SMS invalide ou expiré.", 403);
    }

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return sendError(res, "Cet email est déjà utilisé.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await query(
      `INSERT INTO users (uid, email, password, first_name, last_name, whatsapp, campus, department, gender, country, offered_skills, requested_skills, availability, languages, avatar, verified, is_verified_email, is_verified_sms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, true, true)`,
      [uid, email, hashedPassword, firstName, lastName, phone, campus, department, gender, country, JSON.stringify(offeredSkills || []), JSON.stringify(requestedSkills || []), availability, JSON.stringify(languages || []), avatar]
    );

    // 4. Clean up OTPs to prevent reuse
    await query('DELETE FROM otps WHERE identifier = $1 OR identifier = $2', [`email:${email}`, `phone:${phone}`]);

    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.json({ success: true, uid, token });
  } catch (error: any) {
    console.error('[Register] Error:', error);
    sendError(res, error.message);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return sendError(res, "Email ou mot de passe incorrect.", 401);
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendError(res, "Email ou mot de passe incorrect.", 401);
    }

    const token = jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error: any) {
    console.error('[Login] Error:', error);
    sendError(res, error.message);
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE uid = $1', [req.user.uid]);
    if (result.rows.length === 0) {
      return sendError(res, "Utilisateur non trouvé.", 404);
    }
    const { password, ...userWithoutPassword } = result.rows[0];
    res.json(userWithoutPassword);
  } catch (error: any) {
    sendError(res, error.message);
  }
});

// Generic CRUD endpoints
const tables = ['users', 'services', 'requests', 'blogs', 'testimonials', 'forumTopics', 'connections', 'transactions'];

const toCamelCase = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

tables.forEach(table => {
  const dbTable = table === 'forumTopics' ? 'forum_topics' : table;

  app.get(`/api/${table}`, async (req, res) => {
    try {
      const result = await query(`SELECT * FROM ${dbTable} ORDER BY created_at DESC`);
      res.json(toCamelCase(result.rows));
    } catch (error: any) {
      sendError(res, error.message);
    }
  });

  app.get(`/api/${table}/:id`, async (req, res) => {
    try {
      const idCol = table === 'users' ? 'uid' : 'id';
      const result = await query(`SELECT * FROM ${dbTable} WHERE ${idCol} = $1`, [req.params.id]);
      if (result.rows.length === 0) return sendError(res, "Not found", 404);
      res.json(toCamelCase(result.rows[0]));
    } catch (error: any) {
      sendError(res, error.message);
    }
  });

  app.post(`/api/${table}`, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const body = { ...req.body };
      delete body.id;
      delete body.uid;
      
      const keys = Object.keys(body);
      const values = Object.values(body).map(v => 
        (typeof v === 'object' && v !== null && !Array.isArray(v)) ? JSON.stringify(v) : 
        (Array.isArray(v) && typeof v[0] === 'object') ? JSON.stringify(v) : v
      );
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      // Convert camelCase to snake_case for DB columns
      const columns = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join(', ');
      
      const result = await query(
        `INSERT INTO ${dbTable} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.json(toCamelCase(result.rows[0]));
    } catch (error: any) {
      sendError(res, error.message);
    }
  });

  app.put(`/api/${table}/:id`, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const idCol = table === 'users' ? 'uid' : 'id';
      const body = { ...req.body };
      delete body.id;
      delete body.uid;
      
      const keys = Object.keys(body);
      const values = Object.values(body).map(v => 
        (typeof v === 'object' && v !== null && !Array.isArray(v)) ? JSON.stringify(v) : 
        (Array.isArray(v) && typeof v[0] === 'object') ? JSON.stringify(v) : v
      );
      
      // Check if exists
      const existing = await query(`SELECT * FROM ${dbTable} WHERE ${idCol} = $1`, [req.params.id]);
      
      if (existing.rows.length > 0) {
        // Update
        const setClause = keys.map((k, i) => {
          const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          return `${col} = $${i + 1}`;
        }).join(', ');
        
        const result = await query(
          `UPDATE ${dbTable} SET ${setClause} WHERE ${idCol} = $${keys.length + 1} RETURNING *`,
          [...values, req.params.id]
        );
        res.json(toCamelCase(result.rows[0]));
      } else {
        // Insert with ID
        const allKeys = [idCol, ...keys];
        const allValues = [req.params.id, ...values];
        const placeholders = allKeys.map((_, i) => `$${i + 1}`).join(', ');
        const columns = allKeys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join(', ');
        
        const result = await query(
          `INSERT INTO ${dbTable} (${columns}) VALUES (${placeholders}) RETURNING *`,
          allValues
        );
        res.json(toCamelCase(result.rows[0]));
      }
    } catch (error: any) {
      sendError(res, error.message);
    }
  });

  app.patch(`/api/${table}/:id`, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const idCol = table === 'users' ? 'uid' : 'id';
      const body = { ...req.body };
      delete body.id;
      delete body.uid;
      
      const keys = Object.keys(body);
      
      if (keys.length === 0) {
        return res.json({ success: true });
      }

      const values = Object.values(body).map(v => 
        (typeof v === 'object' && v !== null && !Array.isArray(v)) ? JSON.stringify(v) : 
        (Array.isArray(v) && typeof v[0] === 'object') ? JSON.stringify(v) : v
      );
      
      const setClause = keys.map((k, i) => {
        const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${col} = $${i + 1}`;
      }).join(', ');
      
      const result = await query(
        `UPDATE ${dbTable} SET ${setClause} WHERE ${idCol} = $${keys.length + 1} RETURNING *`,
        [...values, req.params.id]
      );
      res.json(toCamelCase(result.rows[0]));
    } catch (error: any) {
      sendError(res, error.message);
    }
  });

  app.delete(`/api/${table}/:id`, authenticateToken, async (req: AuthRequest, res) => {
    try {
      const idCol = table === 'users' ? 'uid' : 'id';
      await query(`DELETE FROM ${dbTable} WHERE ${idCol} = $1`, [req.params.id]);
      res.json({ success: true });
    } catch (error: any) {
      sendError(res, error.message);
    }
  });
});

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found`, success: false });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    success: false
  });
});


export default app;
