import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        office: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Office",
            required: true,
        },
        jobTitle: {
            type: String,
            required: true,
        },

        jobType: {
            type: String,
            enum: ["Full Time", "Part Time", "Internship"],
            default: "Full Time",
        },

        requiredSkills: [
            {
                type: String,
            },
        ],

        whoCanApply: {
            type: String,
            enum: ["Male", "Female", "All"],
            default: "All"
        },

        experienceRequired: {
            type: Number,
            default: 0,
        },

        educationRequired: {
            type: String,
        },

        salaryRange: {
            min: Number,
            max: Number,
        },

        jobDescription: {
            type: String,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },

    { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);