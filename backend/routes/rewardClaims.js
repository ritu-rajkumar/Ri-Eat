const router = require("express").Router();
const RewardClaim = require("../models/rewardClaim.model");
const Customer = require("../models/customer.model");
const { protect } = require("../middleware/auth.js");

// GET /api/reward-claims?status=Pending|Completed
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customer) filter.customer = req.query.customer;
    const claims = await RewardClaim.find(filter)
      .populate("customer", "customerId name")
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reward-claims/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const claim = await RewardClaim.findById(req.params.id).populate(
      "customer",
      "customerId name phone address"
    );
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/reward-claims/:id/complete -> mark as completed
router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const claim = await RewardClaim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "Completed") {
      claim.status = "Completed";
      await claim.save();

      const customer = await Customer.findById(claim.customer);
      if (customer) {
        const { nextTargetOrders } = req.body;
        const newTarget = Number(nextTargetOrders) || customer.targetOrders; // fallback
        customer.totalOrders = 0;
        customer.targetOrders = newTarget;
        await customer.save();
      }
    }
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
