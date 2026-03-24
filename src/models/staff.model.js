import mongoose, { Schema } from "mongoose";

const staffSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      // required: true,
    },
    gender: {
      type: String,
      // required: true,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
      lowercase: true,
      // unique: true,
      trim: true,
    },
    designation: {
      type: String,
      // required: true,
    },
    mobile: {
      type: String,
      // required: true,
      trim: true,
    },
    mobile_alt: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    facebook: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Staff = mongoose.model("Staff", staffSchema);
