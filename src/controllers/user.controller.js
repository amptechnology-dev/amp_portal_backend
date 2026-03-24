import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something wrong while genarating Access and Refresh Tokens");
  }
};

export const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user in the database
  const user = await User.findOne({ username });
  if (!username || !user) {
    throw new ApiError(401, "Invalid Username");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(401, "User is not active!");
  }

  // Check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Removing unwanted data from user to return
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Set tokens in a secure cookie
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In!"));
});

export const userLogout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = undefined;
  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out!"));
});
