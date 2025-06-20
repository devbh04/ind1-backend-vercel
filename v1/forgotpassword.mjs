import express from 'express'
const router = express.Router();
import { User } from '../models/userDB.mjs';
import nodemailer from 'nodemailer'

const url ={
    local: 'http://localhost:3000',
    web: 'https://ind1-mrjo.vercel.app',
}

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(req.body)
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  user.generatePasswordReset();
  await user.save();

  const resetLink = `${url.web}/reset-password/${user.resetPasswordToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "devthegreat972004@gmail.com",
      pass: "newt eiub cfir iqyj",
    },
  });

  const mailOptions = {
    to: user.email,
    from: "no-reply@example.com",
    subject: "Password Reset",
    text: `Click to reset password: ${resetLink}`,
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: "Password reset link sent!" });
});

router.post("/reset-password/:token", async (req, res) => {
    console.log(req.params)
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = req.body.password; // hash it if needed
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.json({ message: "Password successfully reset" });
});


export default router