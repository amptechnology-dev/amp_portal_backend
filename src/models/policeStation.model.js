import mongoose, { Schema } from "mongoose";

const policeStationSchema = new Schema(
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
  { timestamps: true } 
);

export const PoliceStation = mongoose.model("PoliceStation", policeStationSchema);