import mongoose from 'mongoose';


const complaintSchema = new mongoose.Schema({
  service: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending','open', 'in-progress', 'resolved'], default: 'pending' },
    location: { type: String, required: true },
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;