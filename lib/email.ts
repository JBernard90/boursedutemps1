import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bourse du Temps" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
    return { success: false, error };
  }
}
