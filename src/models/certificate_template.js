import mongoose, { Schema } from "mongoose";

const certificateTemplateSchema = new Schema(
  {
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    certificate_type: {
      type: String, // "bpl", "residential", "income", "character" ইত্যাদি
      required: true,
      trim: true,
    },
    title: {
      type: String, // "BPL Certificate"
      required: true,
    },
    body: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

certificateTemplateSchema.index({ office: 1, certificate_type: 1 }, { unique: true });

export const CertificateTemplate = mongoose.model("CertificateTemplate", certificateTemplateSchema);