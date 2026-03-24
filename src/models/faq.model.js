import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
  },
  edited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Faq = mongoose.model("Faq", FaqSchema);
