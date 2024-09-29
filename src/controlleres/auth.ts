import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

export const register = async (req: Request, res: Response) => {
  const { email, phone, nickName, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      phone,
      nickName,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};
