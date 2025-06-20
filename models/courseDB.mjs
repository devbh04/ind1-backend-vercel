import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  coverPhotoUrl: { type: String, required: true },
  courseLink: { type: String, required: true },
  courseTitle: { type: String, required: true },
  tutorNames: { type: [String], required: true }, // array of tutor names
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  beneficialFor: { type: String, required: true },
  specialization: { type: String, required: true },
  duration: { type: String, required: true },
  courseDetails: { type: String, required: true },
  termsAgreed: { type: Boolean, required: true },
  registeredUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
