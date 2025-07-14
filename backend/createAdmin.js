const mongoose = require("mongoose");
const Admin = require("./models/admin.model");
require("dotenv").config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const username = "admin";
  const password = "admin123"; // You can change this to your desired password

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log("Admin user already exists.");
  } else {
    await Admin.create({ username, password });
    console.log("Admin user created:", username);
  }
  mongoose.disconnect();
}

createAdmin();
