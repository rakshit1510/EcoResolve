import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  gender: { type: String },
  dateOfBirth: { type: Date },
  about: { type: String },
  contactNumber: { type: String },
}, { timestamps: true });
const Profile = mongoose.model('Profile', profileSchema);

export default Profile;