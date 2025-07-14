const router = require("express").Router();
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/forgot-password  { username }
router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const token = crypto.randomBytes(20).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    admin.resetPasswordToken = hashed;
    admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    // Send email
    const toEmail =
      admin.email || process.env.ADMIN_RESET_EMAIL || "aifordev59@gmail.com";
    try {
      const resetLink = `${
        process.env.FRONTEND_BASE_URL || "http://localhost:5000/admin.html"
      }?resetToken=${token}`;
      await sendEmail(
        toEmail,
        "Ri-Eat Admin Password Reset",
        `Click the link below to reset your password (valid for one hour):\n\n${resetLink}\n\nIf the link doesn't work, copy and paste this token in the app: ${token}`
      );
    } catch (err) {
      console.error("Error sending email", err);
    }

    res.json({ message: "Reset token sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/reset-password  { token, newPassword }
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: "Token and new password required" });
  try {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = newPassword; // will be hashed by pre-save hook
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
