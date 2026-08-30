import mongoose, { Schema } from "mongoose";

const heirshipSchema = new Schema(
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
    doe: {
      type: Date, // Date of Expiry/Death (as per PHP cast)
    },
    guardian_name: {
      type: String,
      trim: true,
    },
    guardian_type: {
      type: String,
      trim: true,
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
    id_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentType",
    },
    id_file: {
      type: String,
    },
    tax_receipt: {
      type: String,
    },
    member_authorization: {
      type: String, // file path/url, likely a signed authorization doc
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
  },
  { timestamps: true }
);

heirshipSchema.virtual("successor", {
  ref: "Successor",
  localField: "_id",
  foreignField: "application_no", // ekhon ei field Heirship._id store kore
});

// hasOne Certificate -> see note below before using this
heirshipSchema.virtual("certificate", {
  ref: "Certificate",
  localField: "application_no",
  foreignField: "application_no",
  justOne: true,
});

heirshipSchema.set("toObject", { virtuals: true });
heirshipSchema.set("toJSON", { virtuals: true });

export const Heirship = mongoose.model("Heirship", heirshipSchema);