// resetPassword.js
const nodemailer = require("nodemailer");
const generateOTP = require("./generateOTP");
const Otp = require("../models/otpModel");
require("dotenv").config();

const resetPassword = async (email, subject, content) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Generate OTP
    const otp = generateOTP();

    // Save the OTP in the OTP model
    await new Otp({ email, otp }).save();

    const mailOptions = {
      from: "KAKSIKOR TEAM <support@kaksikor.com>",
      to: email,
      subject: subject,
      html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f2f2;">
        <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">${subject}</h1>
          <p style="color: #555; font-size: 16px; text-align: center;">${content}</p>
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #555; font-size: 18px;">Code: <strong style="font-size: 24px; color: #3498db;">${otp}</strong></p>
              <a href="" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Now</a>
            </div>
          <p style="color: #555; font-size: 16px; text-align: center;">If you did not request this, please ignore this email.</p>
          <p style="color: #555; font-size: 16px; text-align: center;">Best regards,<br>KAKSIKOR TEAM</p>
        </div>
    </div>
    
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent Successfully");
  } catch (error) {
    console.log("Email not sent from reset");
    console.log(error);
  } finally {
    transporter.close();
  }
};

module.exports = resetPassword;
