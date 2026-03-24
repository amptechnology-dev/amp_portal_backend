import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    link: {
      type: String,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["tender", "notice", "notification"],
      default: "notice",
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", noticeSchema);
