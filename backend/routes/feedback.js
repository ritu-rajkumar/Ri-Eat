const router = require("express").Router();
const Feedback = require("../models/feedback.model");
const { protect } = require("../middleware/auth.js");

// POST /api/feedback - Public endpoint for submitting feedback
router.post("/", async (req, res) => {
  try {
    const { name, phone, customerId, menuItem, feedbackText } = req.body;
    if (!name || !phone || !menuItem || !feedbackText) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newFeedback = new Feedback({
      name,
      phone,
      customerId,
      menuItem,
      feedbackText,
    });
    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: "Server error submitting feedback" });
  }
});

// GET /api/feedback - Protected endpoint for admins to view feedback
router.get("/", protect, async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(allFeedback);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching feedback" });
  }
});

module.exports = router;
