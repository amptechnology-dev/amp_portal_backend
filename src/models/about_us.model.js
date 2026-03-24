import mongoose, { Schema } from "mongoose";

const aboutUsSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      trim: true,
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const AboutUs = mongoose.model("AboutUs", aboutUsSchema);
