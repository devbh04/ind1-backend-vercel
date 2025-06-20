// routes/hackathonCandidate.js
import express from "express";
import Hackathon from "../models/hackathonDB.mjs";
import HackathonCandidate from "../models/hackathonCandidateDB.mjs";
import { User } from "../models/userDB.mjs";

const router = express.Router();

// POST /api/v1/hackathon-candidate
router.post("/", async (req, res) => {
  try {
    const {
      user, // user _id
      hackathon, // hackathon _id
      teamName,
      teamMembers,
      gender,
      type,
      institute,
      course,
      specialization,
      graduationYear,
      duration,
      country,
    } = req.body;

    // Step 1: Create HackathonCandidate
    const candidate = await HackathonCandidate.create({
      user,
      hackathon,
      teamName,
      teamMembers: teamMembers.split(",").map((m) => m.trim()),
      gender,
      type,
      institute,
      course,
      specialization,
      graduationYear,
      duration,
      country,
    });

    // Step 2: Update Hackathon document
    await Hackathon.findByIdAndUpdate(hackathon, {
      $addToSet: {
        registeredHackathonCandidate: candidate._id,
        registeredUsers: user,
      },
    });

    // ✅ Step 3: Update User document with registeredHackathon
    await User.findByIdAndUpdate(user, {
      $addToSet: {
        registeredHackathons: hackathon,
      },
    });

    res.status(201).json(candidate);
  } catch (err) {
    console.error("Candidate registration failed:", err);
    res.status(500).json({ error: "Candidate registration failed" });
  }
});

export default router;
