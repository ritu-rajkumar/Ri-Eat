const router = require("express").Router();
const Order = require("../models/order.model");
const MenuItem = require("../models/menu.model");
const { protect } = require("../middleware/auth.js");

// GET /api/analytics/top-items
router.get("/top-items", protect, async (req, res) => {
  try {
    const agg = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.menuItem", qty: { $sum: "$items.quantity" } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]);
    const ids = agg.map((a) => a._id);
    const items = await MenuItem.find({ _id: { $in: ids } }).lean();
    const map = Object.fromEntries(items.map((i) => [String(i._id), i]));
    const result = agg.map((a) => ({ item: map[String(a._id)], qty: a.qty }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/analytics/summary
router.get("/summary", protect, async (req, res) => {
  try {
    const Customer = require("../models/customer.model");
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.revenue || 0;

    const itemsAgg = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: null, qty: { $sum: "$items.quantity" } } },
    ]);
    const totalItems = itemsAgg[0]?.qty || 0;

    res.json({ totalCustomers, totalItems, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/analytics/sales-daily?days=30
router.get("/sales-daily", protect, async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/analytics/top-customers?limit=5
router.get("/top-customers", protect, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const agg = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          spent: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { spent: -1 } },
      { $limit: limit },
    ]);
    const ids = agg.map((a) => a._id);
    const Customer = require("../models/customer.model");
    const custs = await Customer.find({ _id: { $in: ids } }).lean();
    const map = Object.fromEntries(custs.map((c) => [String(c._id), c]));
    const result = agg.map((a) => ({
      customer: map[String(a._id)],
      spent: a.spent,
      orders: a.orders,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
