import mongoose from "mongoose";

const recruitmentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    dob: {
      type: Date
    },

    contactNo: {
      type: String,
      required: true
    },

    cv: {
      type: String   
    },

    image: {
      type: String   // photo file path / url
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    religion: {
      type: String
    },

    address: {
      type: String
    },

    experienceInYears: {
      type: Number,
      default: 0
    },

    previousCompanyName: {
      type: String
    },

    education: {
      type: String
    },

    previousSalary: {
      type: Number
    },

    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Hired"],
      default: "Applied"
    }

  },
  { timestamps: true }
);

export const Recruitment = mongoose.model("Recruitment", recruitmentSchema);