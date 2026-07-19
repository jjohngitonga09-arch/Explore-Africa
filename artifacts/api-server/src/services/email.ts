import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Sojourn Africa" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your Sojourn Africa Verification Code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FDFAF7;">
        <h1 style="color: #C2622D; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">Sojourn Africa</h1>
        <p style="color: #5C4033; font-size: 15px; margin: 0 0 24px 0;">
          Use the code below to verify your email address and complete your registration.
        </p>
        <div style="background: #F5EFE8; border-left: 4px solid #C2622D; padding: 28px; margin: 0 0 24px 0; text-align: center; border-radius: 0 4px 4px 0;">
          <span style="font-size: 48px; font-weight: bold; letter-spacing: 14px; color: #2C1810; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #8B6F47; font-size: 13px; margin: 0 0 8px 0;">
          This code expires in <strong>10 minutes</strong>.
        </p>
        <p style="color: #8B6F47; font-size: 13px; margin: 0 0 32px 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8DDD5; margin: 0 0 24px 0;" />
        <p style="color: #B5907A; font-size: 11px; margin: 0;">
          Curated African experiences for the discerning traveler.
        </p>
      </div>
    `,
  });
}
