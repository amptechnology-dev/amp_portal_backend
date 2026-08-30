import mongoose, { Schema } from "mongoose";

const documentTypeSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: false } 
);

export const DocumentType = mongoose.model("DocumentType", documentTypeSchema);