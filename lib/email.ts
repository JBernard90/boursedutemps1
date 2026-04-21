import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(email: string, code: string) {
  await transporter.sendMail({
    from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Votre code de vérification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bourse du Temps - Code de vérification</h2>
        <p>Votre code de connexion est :</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `,
  });
}

export async function sendContactConfirmationEmail(name: string, email: string, subject: string = '') {
  await transporter.sendMail({
    from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Accusé de réception - Bourse du Temps',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Bourse du Temps</h1>
          <p style="color: #6b7280; margin: 4px 0 0;">Université Senghor</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #1e293b; font-size: 16px;">Bonjour <strong>${name}</strong>,</p>
          <p style="color: #475569;">Nous avons bien reçu votre message${subject ? ` concernant "<strong>${subject}</strong>"` : ''} et nous vous répondrons dans les plus brefs délais.</p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">Notre équipe traite généralement les demandes sous <strong>24 à 48 heures</strong>.</p>
          </div>
          <p style="color: #475569;">Cordialement,<br><strong>L'équipe Bourse du Temps</strong></p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
      </div>
    `,
  });
}

export async function sendContactNotificationEmail(
  name: string, email: string, whatsapp: string,
  organization: string, subject: string, message: string
) {
  const adminEmail = process.env.EMAIL_USER;
  if (!adminEmail) return;
  await transporter.sendMail({
    from: `"Bourse du Temps" <${adminEmail}>`,
    to: adminEmail,
    subject: `Nouveau message de contact : ${subject || 'Sans sujet'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b;">Nouveau message de contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; color: #475569; width: 130px;">Nom</td><td style="padding: 8px; color: #1e293b;">${name}</td></tr>
          <tr style="background:#f8fafc"><td style="padding: 8px; font-weight: bold; color: #475569;">Email</td><td style="padding: 8px; color: #1e293b;">${email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">WhatsApp</td><td style="padding: 8px; color: #1e293b;">${whatsapp || '-'}</td></tr>
          <tr style="background:#f8fafc"><td style="padding: 8px; font-weight: bold; color: #475569;">Organisation</td><td style="padding: 8px; color: #1e293b;">${organization || '-'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Sujet</td><td style="padding: 8px; color: #1e293b;">${subject || '-'}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="font-weight: bold; color: #475569; margin: 0 0 8px;">Message :</p>
          <p style="color: #1e293b; white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
      </div>
    `,
  });
}
