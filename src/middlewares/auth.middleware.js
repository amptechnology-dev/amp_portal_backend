import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Office } from "../models/office.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedData?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Token");
  }
});

export const publicApiAuth = asyncHandler(async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const office_id = req.headers["office-id"];

    if (!apiKey || apiKey !== process.env.PUBLIC_API_KEY) {
      throw new ApiError(401, "Unauthorized Request. Invalid API Key");
    }

    const office = await Office.findById(office_id);

    if (!office || office?.is_active === false) {
      throw new ApiError(401, "Unauthorized Request. Invalid Office Id or Office is inactive");
    }
    req.office = office;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "API Key not found!");
  }
});

export const adminAuth = asyncHandler(async (req, res, next) => {
  // return next();
  try {
    const token = req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // throw new ApiError(401, "Unauthorized Request");
      return res.redirect("/admin/login");
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({ _id: decodedData?._id, isAdmin: true }).select("-password -refreshToken");

    if (!user) {
      // throw new ApiError(401, "Invalid Token");
      return res.redirect("/admin/login");
    }

    req.admin = user;
    next();
  } catch (error) {
    // throw new ApiError(401, error?.message || "Invalid Token");
    return res.redirect("/admin/login");
  }
});
