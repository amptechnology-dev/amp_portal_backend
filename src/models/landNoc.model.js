import mongoose, { Schema } from "mongoose";

const landNocSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    application_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    application_type: {
      type: String,
      trim: true,
      default: "land_noc",
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    sl_no: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dag_no: {
      type: String,
      required: true,
      trim: true,
    },
    khatian_no: {
      type: String,
      required: true,
      trim: true,
    },
    jl_no: {
      type: String,
      required: true,
      trim: true,
    },
    mouza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MouzaMaster",
      required: true,
    },
    land_area: {
      // "In Acre/Katha"
      type: String,
      required: true,
      trim: true,
    },
    chatak: {
      type: String,
      trim: true,
    },
    sq_feet: {
      type: String,
      trim: true,
    },
    ward_sansad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SansadMaster",
      required: true,
    },
    post_office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostOfficeMaster",
      required: true,
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },
    owner_name: {
      type: String,
      required: true,
      trim: true,
    },
    relation_with: {
      type: String,
      required: true,
      trim: true,
    },
    relation_with_name: {
      type: String,
      required: true,
      trim: true,
    },
    from_land_type: {
      type: String,
      required: true,
      trim: true,
    },
    to_land_type: {
      type: String,
      required: true,
      trim: true,
    },
    land_used_as: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    rejected_remarks: {
      type: String,
      trim: true,
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

landNocSchema.virtual("certificate", {
  ref: "Certificate",
  localField: "application_no",
  foreignField: "application_no",
  justOne: true,
});

landNocSchema.set("toObject", { virtuals: true });
landNocSchema.set("toJSON", { virtuals: true });

export const LandNoc = mongoose.model("LandNoc", landNocSchema);