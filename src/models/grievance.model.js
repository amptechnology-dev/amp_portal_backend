import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    file: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "pending", "closed"],
      default: "new",
    },
    remarks: {
      type: String,
      maxLength: 250,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Grievance = mongoose.model("Grievance", grievanceSchema);
