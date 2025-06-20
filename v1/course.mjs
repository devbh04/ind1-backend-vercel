import express from "express";
import Course from "../models/courseDB.mjs";
import { User } from "../models/userDB.mjs";

const router = express.Router();

// Create a new course
router.post("/", async (req, res) => {
  try {
    const {
      coverPhotoUrl,
      courseLink,
      courseTitle,
      tutorNames,
      email,
      mobile,
      beneficialFor,
      specialization,
      duration,
      courseDetails,
      termsAgreed,
      createdBy, // userId who created the course
    } = req.body;

    // Basic validation
    if (!termsAgreed) {
      return res.status(400).json({ error: "You must agree to the terms." });
    }

    const tutorNamesArray = tutorNames.split(",").map((name) => name.trim());

    const newCourse = new Course({
      coverPhotoUrl,
      courseLink,
      courseTitle,
      tutorNames: tutorNamesArray,
      email,
      mobile,
      beneficialFor,
      specialization,
      duration,
      courseDetails,
      termsAgreed,
      registeredUserIds: [], // empty initially
      createdBy,
    });

    await newCourse.save();

    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }); // newest first
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching courses" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Remove this course from all users' registeredCourses
    await User.updateMany(
      { registeredCourses: courseId },
      { $pull: { registeredCourses: courseId } }
    );

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get('/:id/registered-users', async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Populate the registered users
    const users = await User.find({ registeredCourses: courseId }).select(
      'username email mobile gender userType createdAt'
    );

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching registered users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
