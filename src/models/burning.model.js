import mongoose, { Schema } from "mongoose";

const burningSchema = new Schema(
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
      default: "burning",
    },
    issued_by: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    memo_no: {
      type: String,
      required: true,
      trim: true,
    },
    memo_date: {
      type: Date,
      required: true,
    },
    certificate_type: {
      // form dropdown: Burning / Burial
      type: String,
      enum: ["Burning", "Burial"],
      required: true,
    },

    // ---- Deceased person's details ----
    deceased_name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
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
    resident_type: {
      type: String,
      enum: ["PERMANENT_RESIDENT", "TENANT"],
      required: true,
    },
    owner_name: {
      // Owner Name (If Tenant)
      type: String,
      trim: true,
    },
    died_on: {
      type: Date,
      required: true,
    },
    burnt_buried_on: {
      type: Date,
      required: true,
    },
    place: {
      type: String,
      trim: true,
    },
    sansad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SansadMaster",
      required: true,
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },
    post_office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostOfficeMaster",
      required: true,
    },
    mouza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MouzaMaster",
      required: true,
    },
    pin_code: {
      type: String,
      required: true,
      trim: true,
    },

    // ---- Applicant (person receiving the certificate) — different from deceased ----
    issued_to: {
      type: String,
      required: true,
      trim: true,
    },
    relation_with_deceased: {
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

burningSchema.virtual("certificate", {
  ref: "Certificate",
  localField: "application_no",
  foreignField: "application_no",
  justOne: true,
});

burningSchema.set("toObject", { virtuals: true });
burningSchema.set("toJSON", { virtuals: true });

export const Burning = mongoose.model("Burning", burningSchema);