import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@hmdrza/common";

import { User } from "../models/user";
import { PasswordManager } from "../utils/password-manager";

let router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) throw new BadRequestError("Invalid credential");

    let isPasswordMatches = await PasswordManager.comparePassword(
      password,
      user.password
    );
    if (!isPasswordMatches) throw new BadRequestError("Invalid credential");

    //token
    let token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: token,
    };

    res.send(user);
  }
);

export { router as signinRouter };
