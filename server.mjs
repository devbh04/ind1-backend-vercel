import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './v1/auth.mjs';
import userRoutes from './v1/users.mjs';
import internshipRoutes from './v1/internship.mjs';
import applicationsRouter from './v1/application.mjs';
import mentorRouter from './v1/mentor.mjs';
import hackathonRouter from './v1/hackathon.mjs';
import courseRouter from "./v1/course.mjs";
import hackathonCandidateRouter from "./v1/hackhathonCandidate.mjs";
import searchRoutes from './v1/searchroutes.mjs'
import paswordRoute from './v1/forgotpassword.mjs'

dotenv.config();

const app = express();

// Configure CORS properly
const corsOptions = {
  origin: ['http://localhost:3000', 'https://ind1-mrjo.vercel.app'], // Your frontend URLs
  credentials: true, // Allow credentials (cookies, auth headers)
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions)); // Use the configured CORS
app.use(express.json()); // Parse JSON requests

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/mentors', mentorRouter);
app.use('/api/v1/hackathons', hackathonRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/hackathoncandidate", hackathonCandidateRouter);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1', paswordRoute);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});