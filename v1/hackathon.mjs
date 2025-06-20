import express from "express";
import Hackathon from "../models/hackathonDB.mjs";
import { User } from "../models/userDB.mjs"; // ⬅️ Import User model
import HackathonCandidate from "../models/hackathonCandidateDB.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      hackathonTitle,
      hackathonType,
      eventMode,
      visibilityOption,
      organization,
      venue,
      city,
      state,
      country,
      address,
      startDate,
      endDate,
      registrationDeadline,
      contactEmail,
      contactPhone,
      logo,
      websiteUrl,
      hackathonDetails,
      technicalSkills,
      prizeWinner,
      prizeFirstRunnerUp,
      prizeSecondRunnerUp,
      prizeParticipants,
      prizePool,
      stages,
      createdBy,
    } = req.body;

    console.log("Received hackathon data:", req.body);

    const newHackathon = new Hackathon({
      hackathonTitle,
      hackathonType,
      eventMode,
      visibilityOption,
      organization,
      venue,
      city,
      state,
      country,
      address,
      startDate,
      endDate,
      registrationDeadline,
      contactEmail,
      contactPhone,
      logo,
      websiteUrl,
      hackathonDetails,
      technicalSkills: technicalSkills.split(",").map((s) => s.trim()),
      prizeWinner,
      prizeFirstRunnerUp,
      prizeSecondRunnerUp,
      prizeParticipants,
      prizePool,
      stages,
      createdBy,
    });

    await newHackathon.save();

    // 🔥 Update User's postedHackathons
    await User.findByIdAndUpdate(createdBy, {
      $push: { postedHackathons: newHackathon._id },
    });

    res.status(201).json(newHackathon);
  } catch (error) {
    console.error("Hackathon creation failed:", error);
    res.status(500).json({ error: "Hackathon creation failed" });
  }
});

// GET /api/v1/hackathons
router.get("/", async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(hackathons);
  } catch (error) {
    console.error("Failed to fetch hackathons:", error);
    res.status(500).json({ error: "Failed to fetch hackathons" });
  }
});

// Get single hackathon by ID
router.get("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email');

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.status(200).json(hackathon);
  } catch (error) {
    console.error("Failed to fetch hackathon:", error);
    res.status(500).json({ error: "Failed to fetch hackathon" });
  }
});

router.get('/:userId/all', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("postedHackathons")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.postedHackathons);
  } catch (error) {
    console.error("Error fetching posted hackathons:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/participants/:hackathonId", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    console.log("Fetching participants for hackathon:", hackathonId);

    const candidates = await HackathonCandidate.find({ hackathon: hackathonId })
      .populate("user", "username email mobile") // Optional: populate basic user info

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching hackathon participants:", error);
    res.status(500).json({ error: "Failed to fetch hackathon participants" });
  }
});

router.delete("/delete/:hackathonId", async (req, res) => {
  const { hackathonId } = req.params;
  console.log("Deleting hackathon with ID:", hackathonId);
  try {
    // 1. Delete the hackathon
    const hackathon = await Hackathon.findByIdAndDelete(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    // 2. Delete related HackathonCandidate documents
    await HackathonCandidate.deleteMany({ hackathon: hackathonId });

    // 3. Remove hackathonId from postedHackathons and registeredHackathons in all users
    await User.updateMany(
      { postedHackathons: hackathonId },
      { $pull: { postedHackathons: hackathonId } }
    );

    await User.updateMany(
      { registeredHackathons: hackathonId },
      { $pull: { registeredHackathons: hackathonId } }
    );

    res.json({ message: "Hackathon and related data deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
