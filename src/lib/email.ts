import nodemailer from "nodemailer";

// Helper function to check if SMTP is configured
function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!user || !pass || user === "your-email@gmail.com" || pass === "your-app-password") {
    return false;
  }
  return true;
}

// Lazy load transporter to avoid crash on startup if configuration is missing
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!isSmtpConfigured()) {
      console.warn("[SMTP warning] SMTP is not configured or uses placeholder values. Skipping email sending.");
      return { success: false, error: "SMTP is not configured" };
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Hệ thống SGCMP"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`[SMTP success] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP error] Failed to send email to ${to}:`, error);
    return { success: false, error: error.message || String(error) };
  }
}
