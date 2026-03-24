import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    place: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    duration: { type: String, required: true },
    persons: { type: Number, required: true },
    discount: { type: Number },
    left: { type: Number },
    is_active: { type: Boolean, default: true },
    edited_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Package = mongoose.model("Package", packageSchema);
