import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true, default: null },
    departDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    person: { type: Number, required: true },
    status: { type: String, enum: ["new", "pending", "closed"], default: "new" },
    remarks: { type: String, maxLength: 250, default: "" },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model("Enquiry", EnquirySchema);
