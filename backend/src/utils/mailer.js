const nodemailer = require('nodemailer');
require('dotenv').config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendVerificationEmail = async (
  toEmail,
  code
) => {
  await transporter.sendMail({

    from: `"LeafScan" <${process.env.SMTP_FROM ||
      process.env.SMTP_USER
      }>`,

    to: toEmail,

    subject:
      'Your LeafScan verification code',

    text:
      `Your verification code is ${code}. ` +
      `It expires in 10 minutes.`,

    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4fdf8; padding: 40px 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #059669; font-size: 28px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
            LeafScan 🌿
          </h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
            Hello, <br/><br/>
            Thank you for registering with LeafScan! Please use the verification code below to securely verify your account:
          </p>
          
          <div style="background-color: #ecfdf5; border: 2px dashed #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h1 style="color: #047857; font-size: 36px; letter-spacing: 6px; margin: 0;">
              ${code}
            </h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            ⚠️ This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} LeafScan. All rights reserved.</p>
        </div>
      </div>
    `,

  });

};


module.exports = {
  sendVerificationEmail,
};