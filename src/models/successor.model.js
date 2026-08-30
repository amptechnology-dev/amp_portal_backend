import mongoose, { Schema } from "mongoose";

const successorSchema = new Schema(
  {
    application_no: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heirship",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gurdian_name: {
      type: String,
      trim: true, 
    },
    relation: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Successor = mongoose.model("Successor", successorSchema);
