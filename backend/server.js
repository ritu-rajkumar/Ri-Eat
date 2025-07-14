const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const adminRouter = require("./routes/admin");
app.use("/api/admin", adminRouter);

const menuRouter = require("./routes/menu");
app.use("/api/menu", menuRouter);

const customersRouter = require("./routes/customers");
app.use("/api/customers", customersRouter);

const ordersRouter = require("./routes/orders");
app.use("/api/orders", ordersRouter);

const rewardClaimsRouter = require("./routes/rewardClaims");
app.use("/api/reward-claims", rewardClaimsRouter);

const analyticsRouter = require("./routes/analytics");
app.use("/api/analytics", analyticsRouter);

const settingsRouter = require("./routes/settings");
app.use("/api/settings", settingsRouter);

const loyaltyRouter = require("./routes/loyalty");
app.use("/api/loyalty", loyaltyRouter);

const feedbackRouter = require("./routes/feedback");
app.use("/api/feedback", feedbackRouter);

// --- Serve static frontend files ---
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback to index.html or admin.html if needed
app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "admin.html"));
});
app.get("/claim.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "claim.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", async () => {
  console.log("MongoDB database connection established successfully");

  // Clear existing data and add sample data for demonstration
  try {
    const Customer = require("./models/customer.model");
    const MenuItem = require("./models/menu.model");

    await Customer.deleteMany({});
    await MenuItem.deleteMany({});

    await Customer.create({
      customerId: "C004",
      name: "Sarah Wilson",
      phone: "111-222-3333",
      address: "123 Test St",
      totalOrders: 25,
      targetOrders: 30,
      rewardsAvailable: 0,
    });

    const menuItems = [
      { name: "Chatpata Bhujia Sandwich", category: "Chatpata", price: 39 },
      {
        name: "Overloaded Chatpata Bhujia Sandwich",
        category: "Chatpata",
        price: 49,
      },
      { name: "Tandoori Veg Grill Sandwich", category: "Tandoor", price: 49 },
      {
        name: "Overloaded Tandoori Veg Grill Sandwich",
        category: "Tandoor",
        price: 59,
      },
      { name: "Protein Punch Sandwich", category: "Healthy", price: 49 },
      {
        name: "Overloaded Protein Punch Sandwich",
        category: "Healthy",
        price: 69,
      },
    ];
    await MenuItem.insertMany(menuItems);

    console.log("Sample data has been added.");
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
