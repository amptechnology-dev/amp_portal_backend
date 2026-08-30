import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    application_no: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    certificate_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    issue_date: {
      type: Date,
    },
    certificate_type: {
      type: String,
      trim: true,
    },
    issued_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);