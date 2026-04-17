import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction générique
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// Fonction OTP (email)
export async function sendOtpEmail(email: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bourse du Temps - Code de vérification</h2>
      <p>Votre code de connexion est :</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
      <p style="color: #6b7280; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Votre code de vérification',
    html,
  });
}

// Fonction pour le formulaire de contact (optionnelle)
export async function sendContactEmail({
  fullName,
  email,
  whatsapp,
  organization,
  subject,
  message,
}: {
  fullName: string;
  email: string;
  whatsapp: string;
  organization: string;
  subject: string;
  message: string;
}) {
  const html = `
    <h2>Nouveau message via le formulaire de contact</h2>
    <p><strong>Nom :</strong> ${fullName}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>WhatsApp :</strong> ${whatsapp}</p>
    <p><strong>Organisation :</strong> ${organization}</p>
    <p><strong>Sujet :</strong> ${subject}</p>
    <p><strong>Message :</strong></p>
    <p>${message}</p>
  `;

  await sendEmail({
    to: process.env.EMAIL_USER!,
    subject: `📩 Nouveau message : ${subject}`,
    html,
  });
}
