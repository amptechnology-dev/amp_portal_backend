import mongoose from "mongoose";

const usefullinkSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
    required: true,
  },
});

export const UsefulLink = mongoose.model("UsefulLink", usefullinkSchema);
