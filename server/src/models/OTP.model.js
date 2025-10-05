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
<div style="font-family: sans-serif; color: #333;">
    <h2>Welcome to <span style="color:#10b981;">EcoResolve</span> 👋</h2>
    <p>Hello ${name},</p>
    <p>Thank you for joining EcoResolve — your platform to report community issues and get them resolved by local authorities.</p>
    <p>Use the OTP below to verify your email address and start reporting problems in your area:</p>
    <div style="padding: 10px 20px; background-color: #d1fae5; border-radius: 8px; width: fit-content; margin: 15px 0;">
        <h1 style="letter-spacing: 2px; color: #065f46;">${otp}</h1>
    </div>
    <p>This OTP is valid for only <strong>3 minutes</strong>. Do not share it with anyone.</p>
    <p>Let’s make our community cleaner and safer! 🌱</p>
    <p><em>- EcoResolve Team</em></p>
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
