import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
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
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date,
    },
    guardian_name: {
      type: String,
      trim: true,
    },
    guardian_type: {
      type: String,
      trim: true, // e.g. "Father", "Husband", "Mother"
    },
    address: {
      type: String,
      trim: true,
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
    },
    post_office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostOfficeMaster",
    },
    police_station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
    },
    gp: {
      type: String,
      trim: true,
    },
    sansad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SansadMaster",
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "India",
    },
    religion: {
      type: String,
      trim: true,
    },
    caste: {
      type: String,
      trim: true,
    },
    sub_caste: {
      type: String,
      trim: true,
    },
    marital_status: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    yearly_income: {
      type: Number,
      min: 0,
    },
    id_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentType",
    },
    id_file: {
      type: String, // file path/url
    },
    tax_receipt: {
      type: String, // file path/url
    },
    id_no: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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

// PHP hasOne Certificate relationship -> virtual populate
applicationSchema.virtual("certificate", {
  ref: "Certificate",
  localField: "_id",
  foreignField: "application", 
  justOne: true,
});

applicationSchema.set("toObject", { virtuals: true });
applicationSchema.set("toJSON", { virtuals: true });

export const Application = mongoose.model("Application", applicationSchema);