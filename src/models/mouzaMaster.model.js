import mongoose, { Schema } from "mongoose";

const mouzaMasterSchema = new Schema(
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
  { timestamps: false } 
);

export const MouzaMaster = mongoose.model("MouzaMaster", mouzaMasterSchema);