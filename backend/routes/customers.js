const router = require("express").Router();
const Customer = require("../models/customer.model");
const { protect } = require("../middleware/auth.js");

// GET /api/customers - list with optional search by name / phone / customerId via ?q=
router.get("/", protect, async (req, res) => {
  try {
    const { q, sort } = req.query;
    let filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter = {
        $or: [
          { name: regex },
          { phone: regex },
          { customerId: regex },
          { address: regex },
        ],
      };
    }

    let sortObj = { createdAt: -1 };
    if (sort === "orders") sortObj = { totalOrders: -1 };

    if (sort === "spend") {
      // aggregate spending and merge
      const spendAgg = await (
        await require("../models/order.model")
      ).aggregate([
        { $group: { _id: "$customer", totalSpent: { $sum: "$totalAmount" } } },
      ]);
      const spendMap = Object.fromEntries(
        spendAgg.map((s) => [String(s._id), s.totalSpent])
      );
      const customers = await Customer.find(filter).lean();
      customers.forEach((c) => {
        c.totalSpent = spendMap[c._id] || 0;
      });
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
      return res.json(customers);
    }

    const customers = await Customer.find(filter).sort(sortObj);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/customers/:id - fetch by Mongo _id
router.get("/:id", protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/customers/:id/orders - list orders for customer
const Order = require("../models/order.model");
router.get("/:id/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.id })
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/customers - create new customer
router.post("/", protect, async (req, res) => {
  try {
    const { customerId, name, phone, address, targetOrders } = req.body;
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone)
      return res.status(409).json({ message: "Phone already exists" });

    const newCustomer = new Customer({
      customerId,
      name,
      phone,
      address,
      targetOrders,
    });
    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error creating customer", error: err });
  }
});

// PUT /api/customers/:id - update
router.put("/:id", protect, async (req, res) => {
  try {
    const { customerId, name, phone, address, targetOrders, totalOrders } =
      req.body;
    // Build the update object
    const updateObj = { customerId, name, phone, address };
    if (typeof targetOrders !== "undefined")
      updateObj.targetOrders = targetOrders;
    if (typeof totalOrders !== "undefined") updateObj.totalOrders = totalOrders;

    // If either totalOrders or targetOrders is provided, recalc rewardsAvailable
    if (
      typeof totalOrders !== "undefined" ||
      typeof targetOrders !== "undefined"
    ) {
      const newTotal =
        typeof totalOrders !== "undefined" ? totalOrders : undefined;
      const newTarget =
        typeof targetOrders !== "undefined" ? targetOrders : undefined;
      // Fetch current doc to use existing values where needed
      const current = await Customer.findById(req.params.id);
      const calcTotal = newTotal !== undefined ? newTotal : current.totalOrders;
      const calcTarget =
        newTarget !== undefined ? newTarget : current.targetOrders;
      updateObj.rewardsAvailable = Math.floor(calcTotal / calcTarget);
    }

    const updated = await Customer.findByIdAndUpdate(req.params.id, updateObj, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Customer not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating customer", error: err });
  }
});

// DELETE /api/customers/:id - delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
