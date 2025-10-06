import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now ,
        expires: 300 // OTP expires in 5 minutes
    }
}, {
    timestamps: true
});
async function sendVerificationEmail(email, otp) {
  try {
    const name = email.split('@')[0];
    const mailResponse = await mailSender(
      email,
      'Verification Email from EcoResolve',
      `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
        <h2>Welcome to <span style="color:#10b981;">EcoResolve</span> 👋</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up. Please use the OTP below to verify your email address and activate your account:</p>
        <div style="padding: 10px 20px; background-color: #d1fae5; border-radius: 8px; width: fit-content; margin:10px 0;">
          <h1 style="letter-spacing: 2px; color: #065f46;">${otp}</h1>
        </div>
        <p>This OTP is valid for only <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p>Start reporting community issues today 🌱</p>
        <p><em>- The EcoResolve Team</em></p>
      </div>
      `
    );
    console.log('Verification email sent successfully to - ', email);
  } catch (error) {
    console.log('Error while sending an email to ', email, error);
    throw error;
  }
}
OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});


const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
