// models/Internship.js
import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: String,
  title: String,
  duration: String,
  workplaceType: String,
  workLocation: String,
  category: String,
  skillsRequired: [String],
  eligibility: String,
  minStipend: Number,
  maxStipend: Number,
  startDate: Date,
  contactEmail: String,
  contactPhone: String,
  sexDiversity: Boolean,
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  benefits: {
    jobOffer: Boolean,
    certificate: Boolean,
    lor: Boolean,
    insurance: Boolean,
    stipend: Boolean,
    equipment: Boolean
  },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export const Internship = mongoose.model('Internship', internshipSchema);