import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
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
      maxLength: 250,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
