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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: `"Bourse du Temps" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

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