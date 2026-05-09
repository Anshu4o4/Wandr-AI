import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail', // For example
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Wandr AI" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.text,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const message = `
    <h1>Welcome to Wandr AI, ${user.name}!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}" target="_blank">Verify Email</a>
    <p>If you didn't create this account, please ignore this email.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Wandr AI - Verify your email',
    html: message,
    text: `Please verify your email clicking this link: ${verifyUrl}`
  });
};
