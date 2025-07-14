const router = require("express").Router();
const MenuItem = require("../models/menu.model");
const { protect } = require("../middleware/auth.js");

// GET /api/menu/public - Get all menu items for public viewing
router.get("/public", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/menu - Get all menu items (Protected)
router.get("/", protect, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/menu/:id - Get a single menu item
router.get("/:id", protect, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/menu - Create a new menu item
router.post("/", protect, async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const newItem = new MenuItem({ name, category, price });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: "Error creating item", error: err });
  }
});

// PUT /api/menu/:id - Update a menu item
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, category, price },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: "Error updating item", error: err });
  }
});

// DELETE /api/menu/:id - Delete a menu item
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
