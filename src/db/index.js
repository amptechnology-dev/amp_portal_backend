import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONODB_URI);
    console.log("Database Connection has been established successfully. Host: ", mongoose.connection.host);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connectDB;
