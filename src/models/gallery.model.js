import mongoose, { Schema } from "mongoose";

const gallerySchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
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

export const Gallery = mongoose.model("Gallery", gallerySchema);
