import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/userDB.mjs";
import { Internship } from "../models/internshipDB.mjs";
import { Application } from "../models/applicationDB.mjs";
import mongoose from "mongoose";

dotenv.config();
const router = express.Router();

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, // Using the MongoDB ID directly
      req.body,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/userRoutes.mjs
router.post("/:userId/internships", async (req, res) => {
  try {
    const { userId } = req.params;
    const internshipData = req.body;

    const user = await User.findById(userId);
    if (!user || user.userType !== "recruiter") {
      return res
        .status(404)
        .json({ message: "Recruiter not found or not authorized" });
    }

    const internship = new Internship({
      ...internshipData,
      recruiter: userId,
    });

    await internship.save();

    // Push internship ID into User document
    user.postedInternships.push(internship._id);
    await user.save();

    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId/internships", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "postedInternships"
    ); // Populates internship data

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.postedInternships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to your userRoutes.mjs
// Update the delete internship route
router.delete("/:userId/internships/:internshipId", async (req, res) => {
  try {
    const { userId, internshipId } = req.params;

    // Verify the user owns the internship
    const internship = await Internship.findOne({
      _id: internshipId,
      recruiter: userId,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found or you don't have permission to delete it",
      });
    }

    // Delete all applications related to this internship
    await Application.deleteMany({ internship: internshipId });

    // Delete the internship
    await Internship.findByIdAndDelete(internshipId);

    // Remove the internship reference from the user's posted internships array
    await User.findByIdAndUpdate(userId, {
      $pull: { postedInternships: new mongoose.Types.ObjectId(internshipId) },
    });

    // Also remove from all users' registered internships
    await User.updateMany(
      { registeredInternships: internshipId },
      {
        $pull: { registeredInternships: new mongoose.Types.ObjectId(internshipId) },
      }
    );

    res.json({
      success: true,
      message: "Internship and related applications deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete internship",
      error: error.message,
    });
  }
});

// PATCH /api/v1/users/:userId/register-course
router.patch("/:userId/register-course", async (req, res) => {
  try {
    const { courseId } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.registeredCourses.includes(courseId)) {
      user.registeredCourses.push(courseId);
      await user.save();
    }

    res.json({ message: "Course registered", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:userId/registered-courses", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("registeredCourses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.registeredCourses);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/:userId/posted-hackathons", async (req, res) => {
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

// Get registered hackathons
router.get("/:userId/registered-hackathons", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("registeredHackathons")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.registeredHackathons);
  } catch (error) {
    console.error("Error fetching registered hackathons:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this new route to get registered internships
router.get("/:userId/registered-internships", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "registeredInternships"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.registeredInternships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posted mentorships (for mentor users)
router.get('/:userId/mentorships', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('mentorships')
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.mentorships);
  } catch (error) {
    console.error('Error fetching posted mentorships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get registered mentorships (for mentees)
router.get('/:userId/registered-mentorships', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('registeredMentorships')
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.registeredMentorships);
  } catch (error) {
    console.error('Error fetching registered mentorships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// routes/userRoutes.mjs
router.post('/:userId/change-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
