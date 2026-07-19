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

export async function sendSponsorshipAcceptedEmail(
  to: string,
  name: string,
  airportInstructions?: string,
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Sojourn Africa" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🎉 Congratulations — You've Been Selected for the Sojourn Africa Sponsorship",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #FDFAF7;">
        <h1 style="color: #C2622D; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">Sojourn Africa</h1>
        <p style="color: #2C1810; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Dear ${name},</p>
        <p style="color: #5C4033; font-size: 15px; margin: 0 0 24px 0;">
          We are thrilled to inform you that you have been <strong>selected</strong> for the Sojourn Africa Free Sponsorship Programme. 
          Your application stood out among hundreds of submissions, and we are honoured to welcome you on this journey.
        </p>
        <div style="background: #F5EFE8; border-left: 4px solid #C2622D; padding: 20px 24px; margin: 0 0 24px 0; border-radius: 0 4px 4px 0;">
          <p style="color: #C2622D; font-weight: bold; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What happens next</p>
          <ol style="color: #5C4033; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Log in to your Sojourn Africa account</li>
            <li>Navigate to <strong>My Sponsorships</strong></li>
            <li>Complete the processing fee payment to confirm your spot</li>
            <li>Receive your full travel package and instructions</li>
          </ol>
        </div>
        ${airportInstructions ? `
        <div style="background: #EFF7EE; border-left: 4px solid #4CAF50; padding: 20px 24px; margin: 0 0 24px 0;">
          <p style="color: #2E7D32; font-weight: bold; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Airport & Travel Instructions</p>
          <p style="color: #3C4F3B; font-size: 14px; white-space: pre-line; margin: 0;">${airportInstructions}</p>
        </div>
        ` : ""}
        <p style="color: #5C4033; font-size: 14px; margin: 0 0 32px 0;">
          If you have any questions, please do not hesitate to contact our team. We look forward to making your African adventure unforgettable.
        </p>
        <hr style="border: none; border-top: 1px solid #E8DDD5; margin: 0 0 24px 0;" />
        <p style="color: #B5907A; font-size: 11px; margin: 0;">
          Curated African experiences for the discerning traveler. | Sojourn Africa
        </p>
      </div>
    `,
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
