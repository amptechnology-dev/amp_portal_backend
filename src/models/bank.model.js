import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    name: { type: String, required: true, trim: true },
    account: { type: String, required: true, trim: true },
    holderName: { type: String, required: true, trim: true },
    ifsc: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    qr: { type: String, trim: true },
    upi: { type: String, trim: true },
    edited_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
export const Bank = mongoose.model("Bank", bankSchema);
