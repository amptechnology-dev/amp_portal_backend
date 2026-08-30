import mongoose, { Schema } from "mongoose";

const postOfficeMasterSchema = new Schema(
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
    pincode: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } 
);

export const PostOfficeMaster = mongoose.model("PostOfficeMaster", postOfficeMasterSchema, "post_office_master");