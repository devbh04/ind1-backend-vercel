import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userDB.mjs';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { userType, username, email, mobile, gender, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      userType,
      username,
      email,
      mobile,
      gender,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        userType: user.userType,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    console.log('Login attempt:', { usernameOrEmail, password });

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        userType: user.userType,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;