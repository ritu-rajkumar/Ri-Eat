const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    totalOrders: { type: Number, default: 0 },
    targetOrders: { type: Number, required: true },
    rewardsAvailable: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
