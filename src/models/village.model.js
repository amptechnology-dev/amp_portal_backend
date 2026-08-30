import mongoose, { Schema } from "mongoose";

const villageSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } 
);

export const Village = mongoose.model("Village", villageSchema);