import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  mobile: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, 
});

export const Otp = mongoose.model("Otp", otpSchema);