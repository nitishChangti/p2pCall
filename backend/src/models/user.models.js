import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    socketId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

/* Hash password */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

   try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    throw err; // will be caught by asyncHandler at controller level
  }
});

/* Compare password */
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* Access Token */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      name: this.name,
    },
    config.get("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: config.get("ACCESS_TOKEN_EXPIRY"),
    },
  );
};

/* Refresh Token */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    config.get("REFRESH_TOKEN_SECRET"),
    {
      expiresIn: config.get("REFRESH_TOKEN_EXPIRY"),
    },
  );
};

export default mongoose.model("User", userSchema);
