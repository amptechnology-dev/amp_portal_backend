import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { publicApiAuth } from "./middlewares/auth.middleware.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// view engine setup
app.set('views', "./src/views");
app.set("view engine", "ejs");

import { verifyJWT } from "./middlewares/auth.middleware.js";
//routes import
import userRouter from "./routes/user.routes.js";
import testRouter from "./routes/test.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import publicRouter from "./routes/public.routes.js";
import adminRouter from "./routes/admin.routes.js"

//routes declaration
app.use("/api/users", userRouter);
app.use("/api/dashboard", verifyJWT, dashboardRouter);
app.use("/", testRouter);
app.use("/api/public", publicApiAuth, publicRouter);
app.use("/admin", adminRouter);

// http://localhost:8000/api/v1/users/register

export { app };
