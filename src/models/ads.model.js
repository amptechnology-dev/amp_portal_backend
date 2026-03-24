import mongoose from "mongoose";

const adsSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Ads = mongoose.model("Ads", adsSchema);
