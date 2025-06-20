import express from 'express';
import Mentor from '../models/mentorDB.mjs';
import { User } from '../models/userDB.mjs';


const router = express.Router();

// Create Mentor
router.post('/', async (req, res) => {
  try {
    const { userId, ...mentorData } = req.body;
    console.log('Received mentor data:', mentorData);
    console.log('Received userId:', userId);

    // Validate userId
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create mentor with reference
    const mentor = new Mentor({
      ...mentorData,
      user: userId
    });

    await mentor.save();

    // Push mentor ID to user's mentorships array
    user.mentorships.push(mentor._id);
    await user.save();

    res.status(201).json(mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get mentors posted by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const mentors = await Mentor.find({ user: req.params.userId });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find().populate('user', 'name email'); // Optionally populate user info
    res.status(200).json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this to your mentor routes (before export)
// Add this to your mentor routes (already exists, just modify inside)
router.post('/:id/request', async (req, res) => {
  try {
    const { userId } = req.body;
    const mentorId = req.params.id;

    const [user, mentor] = await Promise.all([
      User.findById(userId),
      Mentor.findById(mentorId)
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    // Check if mentorship already requested
    if (user.registeredMentorships.includes(mentorId)) {
      return res.status(400).json({ error: 'Mentorship already requested' });
    }

    // ✅ Push mentorId to user.registeredMentorships
    user.registeredMentorships.push(mentorId);

    // ✅ Push userId to mentor.registeredUsers
    mentor.registeredUsers.push(userId);

    await Promise.all([user.save(), mentor.save()]);

    res.status(200).json({
      message: 'Mentorship request successful',
      mentor: mentorId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get registered users for a specific mentorship
// Updated route in your backend (mentor routes file)
router.get('/:id/registered-users', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate({
      path: 'registeredUsers',
      select: 'username email mobile gender userType registeredMentorships',
      // Add projection to format the data better
      options: {
        sort: { username: 1 } // Sort alphabetically by username
      }
    });
    
    if (!mentor) {
      return res.status(404).json({ 
        success: false,
        error: 'Mentorship not found' 
      });
    }
    
    // Transform the data for better frontend consumption
    const users = mentor.registeredUsers.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      userType: user.userType,
      mentorshipCount: user.registeredMentorships?.length || 0
    }));
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching registered users:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching registered users' 
    });
  }
});

// Delete a mentorship
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the mentor to get the user reference
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    // Remove mentor from user's mentorships array
    await User.findByIdAndUpdate(
      mentor.user,
      { $pull: { mentorships: id } }
    );

    // Remove this mentorship from all users' registeredMentorships
    await User.updateMany(
      { registeredMentorships: id },
      { $pull: { registeredMentorships: id } }
    );

    // Finally delete the mentor
    await Mentor.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Mentorship deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting mentorship:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
