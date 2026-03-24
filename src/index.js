import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8001, () => {
      console.log(`⚙️ Server is running at : http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection failed !!! ", err);
  });
