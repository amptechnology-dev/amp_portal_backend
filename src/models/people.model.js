import mongoose from "mongoose";

const peopleSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
    required: true,
  },
  link: {
    type: String,
    trim: true,
  },
});

export const People = mongoose.model("People", peopleSchema);
