import express from "express";

const Router = express.Router();
import { registerUser,getCurrentUser, loginUser,UserLogOut } from "../controllers/user.controllers.js";
import { body } from "express-validator";
import {verifyJWT} from '../middlewares/verifyJwt.middlewares.js'
Router.route("/register").post(
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  registerUser,
);

Router.route('/getCurrentUserData').get(verifyJWT, getCurrentUser)

Router.route('/login').post(
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  loginUser)

Router.route('/logout').get(verifyJWT,UserLogOut)
export default Router;
