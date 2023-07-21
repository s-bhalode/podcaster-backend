const otpGenerator = require('otp-generator');

OTP_LENGTH = 6
OTP_CONFIG = {
    upperCaseAlphabets: false,
    specialChars: false,
}
module.exports.generateOTP = () => {
    const OTP = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
    return OTP;
}