const router = require("express").Router();
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const MenuItem = require("../models/menu.model");
const { protect } = require("../middleware/auth.js");

// GET /api/orders - list all orders, optional ?customer=<customerId>
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }
    const orders = await Order.find(filter)
      .populate("customer", "customerId name")
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "customerId name")
      .populate("items.menuItem", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/orders - create order { customer: <id>, items: [{menuItem:<id>, quantity: Number}] }
router.post("/", protect, async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer || !items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Invalid payload" });

    // calculate total
    const menuIds = items.map((i) => i.menuItem);
    const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
    const priceMap = Object.fromEntries(
      menuDocs.map((m) => [String(m._id), m.price])
    );

    let totalAmount = 0;
    items.forEach((i) => {
      const price = priceMap[String(i.menuItem)];
      if (!price) throw new Error("Invalid menu item");
      totalAmount += price * i.quantity;
    });

    const qtySum = items.reduce((sum, i) => sum + i.quantity, 0);

    const newOrder = new Order({ customer, items, totalAmount });
    const saved = await newOrder.save();

    // Check for new rewards earned
    const customerDoc = await Customer.findById(customer);
    if (customerDoc) {
      const oldTotalOrders = customerDoc.totalOrders;
      const newTotalOrders = oldTotalOrders + qtySum;

      if (customerDoc.targetOrders > 0) {
        const oldRewards = Math.floor(
          oldTotalOrders / customerDoc.targetOrders
        );
        const newRewards = Math.floor(
          newTotalOrders / customerDoc.targetOrders
        );
        if (newRewards > oldRewards) {
          customerDoc.rewardsAvailable += newRewards - oldRewards;
        }
      }
      customerDoc.totalOrders = newTotalOrders;
      await customerDoc.save();
    }

    await saved.populate([
      { path: "customer", select: "customerId name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating order:", err);
    res
      .status(500)
      .json({ message: "Error creating order", error: err.toString() });
  }
});

// PUT /api/orders/:id - update order
router.put("/:id", protect, async (req, res) => {
  try {
    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    const { customer, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Invalid items" });

    const menuIds = items.map((i) => i.menuItem);
    const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
    const priceMap = Object.fromEntries(
      menuDocs.map((m) => [String(m._id), m.price])
    );

    let totalAmount = 0;
    items.forEach((i) => {
      const price = priceMap[String(i.menuItem)];
      if (!price) throw new Error("Invalid menu item");
      totalAmount += price * i.quantity;
    });

    const oldQty = existing.items.reduce((s, i) => s + i.quantity, 0);
    const newQty = items.reduce((s, i) => s + i.quantity, 0);
    const qtyDiff = newQty - oldQty;

    // Logic for customer change or quantity change
    if (customer && String(existing.customer) !== customer) {
      // Customer has changed. Decrement from old, increment for new.
      const oldCustomer = await Customer.findById(existing.customer);
      if (oldCustomer) {
        const oldTotalForOldCustomer = oldCustomer.totalOrders;
        oldCustomer.totalOrders = Math.max(0, oldTotalForOldCustomer - oldQty);
        const oldRewardsForOld = Math.floor(
          oldTotalForOldCustomer / oldCustomer.targetOrders
        );
        const newRewardsForOld = Math.floor(
          oldCustomer.totalOrders / oldCustomer.targetOrders
        );
        if (oldRewardsForOld > newRewardsForOld) {
          oldCustomer.rewardsAvailable = Math.max(
            0,
            oldCustomer.rewardsAvailable - (oldRewardsForOld - newRewardsForOld)
          );
        }
        await oldCustomer.save();
      }

      const newCustomer = await Customer.findById(customer);
      if (newCustomer) {
        const oldTotalForNewCustomer = newCustomer.totalOrders;
        newCustomer.totalOrders += newQty;
        const oldRewardsForNew = Math.floor(
          oldTotalForNewCustomer / newCustomer.targetOrders
        );
        const newRewardsForNew = Math.floor(
          newCustomer.totalOrders / newCustomer.targetOrders
        );
        if (newRewardsForNew > oldRewardsForNew) {
          newCustomer.rewardsAvailable += newRewardsForNew - oldRewardsForNew;
        }
        await newCustomer.save();
      }
    } else if (qtyDiff !== 0) {
      // Same customer, quantity changed
      const customerDoc = await Customer.findById(existing.customer);
      if (customerDoc) {
        const oldTotalOrders = customerDoc.totalOrders;
        const newTotalOrders = oldTotalOrders + qtyDiff;
        if (customerDoc.targetOrders > 0) {
          const oldRewards = Math.floor(
            oldTotalOrders / customerDoc.targetOrders
          );
          const newRewards = Math.floor(
            newTotalOrders / customerDoc.targetOrders
          );
          if (newRewards > oldRewards) {
            customerDoc.rewardsAvailable += newRewards - oldRewards;
          } else if (oldRewards > newRewards) {
            customerDoc.rewardsAvailable = Math.max(
              0,
              customerDoc.rewardsAvailable - (oldRewards - newRewards)
            );
          }
        }
        customerDoc.totalOrders = newTotalOrders;
        await customerDoc.save();
      }
    }

    existing.customer = customer;
    existing.items = items;
    existing.totalAmount = totalAmount;
    const updatedOrder = await existing.save();

    await updatedOrder.populate([
      { path: "customer", select: "customerId name" },
      { path: "items.menuItem", select: "name price" },
    ]);

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Error updating order", error: err.toString() });
  }
});

// DELETE /api/orders/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    const qtyDel = deleted.items.reduce((s, i) => s + i.quantity, 0);

    const customerDoc = await Customer.findById(deleted.customer);
    if (customerDoc) {
      const oldTotalOrders = customerDoc.totalOrders;
      const newTotalOrders = Math.max(0, oldTotalOrders - qtyDel);

      if (customerDoc.targetOrders > 0) {
        const oldRewards = Math.floor(
          oldTotalOrders / customerDoc.targetOrders
        );
        const newRewards = Math.floor(
          newTotalOrders / customerDoc.targetOrders
        );

        if (oldRewards > newRewards) {
          customerDoc.rewardsAvailable = Math.max(
            0,
            customerDoc.rewardsAvailable - (oldRewards - newRewards)
          );
        }
      }
      customerDoc.totalOrders = newTotalOrders;
      await customerDoc.save();
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
