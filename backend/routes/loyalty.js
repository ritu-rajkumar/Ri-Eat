const router = require("express").Router();
const Customer = require("../models/customer.model");

router.route("/:customerId").get(async (req, res) => {
  try {
    const customer = await Customer.findOne({
      customerId: req.params.customerId,
    });
    if (customer) {
      res.json({
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        targetOrders: customer.targetOrders,
        rewardsAvailable: customer.rewardsAvailable,
      });
    } else {
      res.status(404).json("Customer not found");
    }
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});

router.post("/claim", async (req, res) => {
  try {
    const { customerId, name, phone, address, experience } = req.body;
    if (!customerId || !name || !phone || !address || !experience) {
      return res.status(400).json({ message: "All fields required" });
    }
    const customer = await Customer.findOne({ customerId });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    if (customer.rewardsAvailable < 1) {
      return res.status(400).json({ message: "No rewards available to claim" });
    }
    const RewardClaim = require("../models/rewardClaim.model");
    const claim = new RewardClaim({
      customer: customer._id,
      name,
      phone,
      address,
      experience,
      ordersAtClaim: customer.totalOrders,
    });
    await claim.save();

    // Decrement rewards available
    customer.rewardsAvailable -= 1;
    await customer.save();

    res.status(201).json({ message: "Claim submitted" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting claim" });
  }
});

module.exports = router;
