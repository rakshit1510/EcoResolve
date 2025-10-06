import mongoose from 'mongoose';


const complaintSchema = new mongoose.Schema({
  department: { 
    type: String, 
    required: true,
    enum: [
      'Public Works Department (PWD)',
      'Sanitation Department',
      'Water Supply Department', 
      'Electricity Department',
      'Parks & Environment Department'
    ]
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','open', 'in-progress', 'resolved'], default: 'pending' },
  location: { type: String, required: true },
  imageUrl: { type: String , required: true},
  description: { type: String , required: true },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;