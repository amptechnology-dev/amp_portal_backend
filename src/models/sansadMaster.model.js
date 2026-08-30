import mongoose, { Schema } from "mongoose";

const sansadMasterSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    sansad_no: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: false } 
);

export const SansadMaster = mongoose.model("SansadMaster", sansadMasterSchema, "sansad_master");