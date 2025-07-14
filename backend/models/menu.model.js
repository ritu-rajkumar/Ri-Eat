const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    // Allow any category string so admin can create new categories dynamically
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
