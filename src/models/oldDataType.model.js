import mongoose, { Schema } from "mongoose";

const oldDataTypeSchema = new Schema(
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
  { timestamps: false } // PHP model e $timestamps = false chilo
);

export const OldDataType = mongoose.model("OldDataType", oldDataTypeSchema);