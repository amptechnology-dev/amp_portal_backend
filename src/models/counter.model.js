import mongoose from "mongoose";

const counterItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  value: { type: Number, required: true },
});

const counterSchema = new mongoose.Schema({
  office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
  counter: [counterItemSchema],
});

export const Counter = mongoose.model("Counter", counterSchema);
