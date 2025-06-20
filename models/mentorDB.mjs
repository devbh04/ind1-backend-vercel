// models/mentorDB.mjs
import mongoose from 'mongoose';

// models/mentorDB.mjs
const mentorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoUrl: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  organization: { type: String, required: true },
  currentRole: { type: String, required: true },
  workExperience: { type: Number, required: true },
  headline: { type: String, required: true },
  bio: { type: String, required: true },
  languages: [{ type: String, required: true }],
  availability: { type: String },
  expertise: [{ type: String }],
  skills: [{ type: String }],
  mentoringApproach: { type: String },
  socialMedia: {
    linkedin: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    instagram: { type: String }
  },
  // ✅ New field to track registered users
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
