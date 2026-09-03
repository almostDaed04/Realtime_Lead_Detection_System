const nodemailer = require('nodemailer');

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

    from: `"LeafScan" <${
      process.env.SMTP_FROM ||
      process.env.SMTP_USER
    }>`,

    to: toEmail,

    subject:
      'Your LeafScan verification code',

    text:
      `Your verification code is ${code}. ` +
      `It expires in 10 minutes.`,

    html: `
      <div>
        <h2>LeafScan 🌿</h2>

        <p>
          Your verification code is:
        </p>

        <h1>
          ${code}
        </h1>

        <p>
          It expires in 10 minutes.
        </p>
      </div>
    `,

  });

};


module.exports = {
  sendVerificationEmail,
};