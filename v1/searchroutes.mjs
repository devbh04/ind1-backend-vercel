// routes/searchRoutes.js
import express from 'express'
const router = express.Router();
import Course from '../models/courseDB.mjs';
import Hackathon from '../models/hackathonDB.mjs';
import { Internship } from '../models/internshipDB.mjs';
import Mentor from '../models/mentorDB.mjs';

// Search across all collections
router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Search across all collections in parallel
    const [courses, hackathons, internships, mentors] = await Promise.all([
      // Courses search
      Course.find({
        $or: [
          { courseTitle: { $regex: query, $options: 'i' } },
          { tutorNames: { $regex: query, $options: 'i' } },
          { beneficialFor: { $regex: query, $options: 'i' } },
          { specialization: { $regex: query, $options: 'i' } },
        ],
      }).limit(5),

      // Hackathons search
      Hackathon.find({
        $or: [
          { hackathonTitle: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { state: { $regex: query, $options: 'i' } },
          { country: { $regex: query, $options: 'i' } },
          { technicalSkills: { $regex: query, $options: 'i' } },
        ],
      }).limit(5),

      // Internships search
      Internship.find({
        $or: [
          { companyName: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { workLocation: { $regex: query, $options: 'i' } },
          { skillsRequired: { $regex: query, $options: 'i' } },
        ],
      }).limit(5),

      // Mentors search
      Mentor.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { organization: { $regex: query, $options: 'i' } },
          { expertise: { $regex: query, $options: 'i' } },
          { skills: { $regex: query, $options: 'i' } },
        ],
      }).limit(5),
    ]);

    res.json({
      courses,
      hackathons,
      internships,
      mentors,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router