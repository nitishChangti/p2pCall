import User from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiRes.utils.js";
import { validationResult } from "express-validator";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // ✅ ONE SAVE ONLY
  const user = await User.create({ name, email, password });

  // ✅ Generate tokens WITHOUT saving again
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // ✅ Update refreshToken safely
  await User.updateOne({ _id: user._id }, { refreshToken });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        { createdUser, accessToken },
        "User registered successfully",
        true,
      ),
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(`this is a controller of getcurrentuser ${req.user}`);
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched", true));
});

export const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token
  await User.findByIdAndUpdate(user._id, { refreshToken });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: loggedInUser }, "Login successful", true),
    );
});

export const UserLogOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1️⃣ Remove refresh token from DB
  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: null } },
    { new: true },
  );

  // 2️⃣ Cookie options (MUST match login cookie options)
  const options = {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "strict",
  };

  // 3️⃣ Clear cookies
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
