import mongoose, { Schema } from "mongoose";

const servicesSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "fa-solid fa-thumbs-up",
      trim: true,
    },
    url: {
      type: String,
      default: "#",
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

export const Service = mongoose.model("Service", servicesSchema);
