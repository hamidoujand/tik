import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@hmdrza/common";
import jwt from "jsonwebtoken";

import { User } from "../models/user";

let router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) throw new BadRequestError("Email already in use");

    let user = User.build({
      email,
      password,
    });
    await user.save();

    let token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: token,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
