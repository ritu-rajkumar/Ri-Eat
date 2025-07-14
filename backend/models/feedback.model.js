const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
      default: "",
    },
    menuItem: {
      type: String, // Can be an item name or 'General'
      required: true,
    },
    feedbackText: {
      type: String,
      required: [true, "Feedback text is required"],
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
