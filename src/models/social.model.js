import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    youtube: {
      type: String,
      trim: true,
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Social = mongoose.model("Social", socialSchema);
