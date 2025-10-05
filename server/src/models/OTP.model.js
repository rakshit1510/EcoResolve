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
            'Verification Email from LearnSpark',
            `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Welcome to <span style="color:#6366f1;">LearnSpark</span> 👋</h2>
                <p>Thank you for signing up. Please use the OTP below to verify your email address:</p>
                <div style="padding: 10px 20px; background-color: #f0f0f0; border-radius: 8px; width: fit-content;">
                    <h1 style="letter-spacing: 2px; color: #4f46e5;">${otp}</h1>
                </div>
                <p>This OTP is valid for only <strong>10 minutes</strong>. Do not share it with anyone.</p>
                <p>Happy Learning! 🚀</p>
                <p><em>- LearnSpark Team</em></p>
            </div>
            `
        );
        console.log('Email sent successfully to - ', email);
    } catch (error) {
        console.log('Error while sending an email to ', email);
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
