import express from 'express';
import { Internship } from '../models/internshipDB.mjs';
import { Application } from '../models/applicationDB.mjs';
import { User } from '../models/userDB.mjs';

const router = express.Router();

// Apply for an internship
router.post("/:internshipId/apply", async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { applicant, ...applicationData } = req.body;

    if (!applicant) {
      return res.status(400).json({ error: "Applicant ID is required" });
    }

    const [internship, user] = await Promise.all([
      Internship.findById(internshipId),
      User.findById(applicant),
    ]);

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const existingApplication = await Application.findOne({
      internship: internshipId,
      applicant,
    });

    if (existingApplication) {
      return res.status(409).json({ error: "Application already exists" });
    }

    const application = new Application({
      ...applicationData,
      internship: internshipId,
      user: applicant,
      status: "pending",
    });

    await application.save();

    internship.applications.push(application._id);
    await internship.save();

    // ✅ Add internship to user's registeredInternships
    if (!user.registeredInternships.includes(internshipId)) {
      user.registeredInternships.push(internshipId);
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

// Get all applications for an internship (with full applicant details)
router.get('/internship/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify internship exists
    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Get applications with populated user data
    const applications = await Application.find({ internship: id })
      .populate({
        path: 'user',
        select: 'firstName lastName email mobile gender'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications.map(app => ({
        ...app.toObject(),
        applicant: app.user, // Flatten the user data
        user: undefined // Remove the nested user field
      }))
    });

  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

export default router;