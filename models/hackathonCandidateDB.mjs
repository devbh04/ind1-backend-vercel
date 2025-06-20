// models/hackathonCandidate.js
import mongoose from "mongoose";

const HackathonCandidateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    teamName: String,
    teamMembers: [String],
    gender: String,
    type: String,
    institute: String,
    course: String,
    specialization: String,
    graduationYear: String,
    duration: String,
    country: String,
  },
  { timestamps: true }
);

export default mongoose.models.HackathonCandidate ||
  mongoose.model("HackathonCandidate", HackathonCandidateSchema);
