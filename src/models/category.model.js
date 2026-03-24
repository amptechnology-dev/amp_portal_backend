import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
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
});

export const Category = mongoose.model("Category", categorySchema);
