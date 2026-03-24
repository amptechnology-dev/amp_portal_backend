import mongoose from "mongoose";

const headingSchema = new mongoose.Schema({
  office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
  people: { type: String, default: "Meet the Owners" },
  headerImage: String,
  footerImage: String,
});

export const Heading = mongoose.model("Heading", headingSchema);
