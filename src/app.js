import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { publicApiAuth, verifyAdminJWT, verifyJWT } from "./middlewares/auth.middleware.js";

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
app.set("views", "./src/views");
app.set("view engine", "ejs");

//routes import
import userRouter from "./routes/user.routes.js";
import testRouter from "./routes/test.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import publicRouter from "./routes/public.routes.js";
import adminRouter from "./routes/admin.routes.js";
import applicationRouter from "./routes/application.routes.js";
import { publicCertificateRouter, adminCertificateRouter } from "./routes/certificate.routes.js";
import applicationAdminRouter from "./routes/applicationAdmin.routes.js";
import masterDataRouter from "./routes/masterData.routes.js";
import userFileDownloadRouter from "./routes/userFileDownload.routes.js";

//routes declaration
app.use("/api/users", userRouter);
app.use("/api/dashboard", verifyJWT, dashboardRouter);
app.use("/", testRouter);

// ---------- Public (citizen-facing) APIs — needs x-api-key + office-id header ----------
app.use("/api/public", publicApiAuth, publicRouter);
app.use("/api/public", publicApiAuth, applicationRouter);
app.use("/api/public", publicApiAuth, publicCertificateRouter);
app.use("/api/public", publicApiAuth, userFileDownloadRouter);

// ---------- Admin EJS panel (session/cookie based) ----------
app.use("/admin", adminRouter);

// ---------- Admin JSON APIs — needs admin JWT (Bearer token / accessToken cookie) ----------
app.use("/api/admin/application", verifyAdminJWT, applicationAdminRouter);
app.use("/api/admin/application", verifyAdminJWT, adminCertificateRouter);
app.use("/api/admin/manage_data", verifyAdminJWT, masterDataRouter);

// http://localhost:8000/api/v1/users/register

// ---------- Error Handling (always last) ----------

// Multer-specific error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "File size must be under 300 KB" : err.message,
    });
  }
  next(err);
});

// Global fallback error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };