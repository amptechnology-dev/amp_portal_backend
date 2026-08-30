import mongoose, { Schema } from "mongoose";

const downloadSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: String,
      required: true, 
    },
  },
  { timestamps: true }
);

export const Download = mongoose.model("Download", downloadSchema);