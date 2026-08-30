import mongoose, { Schema } from "mongoose";

const guidelineSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    form_type: {
      type: String,
      required: true,
      trim: true,
    },
    guidelines: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Guideline = mongoose.model("Guideline", guidelineSchema);