// backend/v1/internships.js
import express from 'express';
import { Internship } from "../models/internshipDB.mjs";
import { User } from "../models/userDB.mjs";

const router = express.Router();

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find({})
      .populate('recruiter', 'username email companyName');
    
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// In your internships routes file
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('recruiter', 'username email companyName');
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;