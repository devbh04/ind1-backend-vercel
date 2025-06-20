// models/hackathonDB.mjs
import mongoose from "mongoose";

const StageSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  link: String,
});

const HackathonSchema = new mongoose.Schema(
  {
    hackathonTitle: { type: String, required: true },
    hackathonType: { type: String, required: true },
    eventMode: { type: String, enum: ["online", "offline", "hybrid"], required: true },
    visibilityOption: { type: String, enum: ["public", "private"], required: true },
    organization: String,
    venue: String,
    city: String,
    state: String,
    country: String,
    address: String,
    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,
    contactEmail: String,
    contactPhone: String,
    logo: String,
    websiteUrl: String,
    hackathonDetails: String,
    technicalSkills: [String],
    prizeWinner: String,
    prizeFirstRunnerUp: String,
    prizeSecondRunnerUp: String,
    prizeParticipants: String,
    prizePool: String,
    stages: [StageSchema],

    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    registeredHackathonCandidate: [{ type: mongoose.Schema.Types.ObjectId, ref: "HackathonCandidate" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Hackathon || mongoose.model("Hackathon", HackathonSchema);
