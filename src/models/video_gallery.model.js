import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
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
    link: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const VideoGallery = mongoose.model("VideoGallery", videoSchema);
