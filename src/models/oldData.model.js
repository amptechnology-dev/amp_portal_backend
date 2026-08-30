import mongoose, { Schema } from "mongoose";

const oldDataSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    type: {
      type: String,
      trim: true,
    },
    no: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    document_type: {
      type: String,
      trim: true,
    },
    document_no: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const OldData = mongoose.model("OldData", oldDataSchema);