// generateOTP.js
const generateOTP = () => {
  // Your OTP generation logic here
  const otpLength = 6;
  const otp = Math.random()
    .toString()
    .slice(2, otpLength + 2);
  return otp;
};

module.exports = generateOTP;
