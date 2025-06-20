// models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['female', 'male', 'transgender', 'non-binary', 'prefer not to say'],
    required: true
  },
  institute: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['college students', 'professional', 'fresher', 'recruiter'],
    required: true
  },
  course: {
    type: String,
    enum: ['btech', 'bsc', 'mtech', 'mba'],
    required: true
  },
  specialization: {
    type: String,
    enum: ['aiml', 'cse', 'ece', 'mech'],
    required: true
  },
  graduationYear: {
    type: String,
    required: true
  },
  courseDuration: {
    type: String,
    enum: ['4year', '3year', '2year'],
    required: true
  },
  diffAbled: {
    type: Boolean,
    required: true
  },
  country: {
    type: String,
    enum: ['india', 'usa', 'uk', 'canada'],
    required: true
  },
  resumeLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

export const Application = mongoose.model('Application', applicationSchema);