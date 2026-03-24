import mongoose, { Schema } from "mongoose";

const officeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      maxLength: 150,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    mobile_alt: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    landline: String,
    email: {
      type: String,
      required: true,
      lowecase: true,
      trim: true,
    },
    block: String,
    district: String,
    is_active: {
      type: Boolean,
      default: true,
    },
    start_date: Date,
    fin_year: {
      type: String,
      maxLength: 9,
    },
    office_id: {
      type: Number,
      index: true,
    },
    banner: {
      type: [String],
      trim: true,
      default: [],
    },
    logo: String,
    logo_alt: String,
    address_url: String,
    enabled_services: {
      type: [String],
      enum: ["about", "ads", "faq", "gallery", "notice", "service", "staff", "grievance", "video-gallery", "people", "counter", "video-banner"],
      default: ["about", "ads", "faq", "gallery", "notice", "service", "staff", "grievance"],
    },
    notification_bg_iamge: String,
    activity_bg_iamge: String,
    video_banner: String,
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Office = mongoose.model("Office", officeSchema);
