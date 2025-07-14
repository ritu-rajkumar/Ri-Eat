const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const rewardClaimSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    experience: { type: String, required: true },
    ordersAtClaim: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const RewardClaim = mongoose.model("RewardClaim", rewardClaimSchema);

module.exports = RewardClaim;
