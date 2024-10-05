import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { sign, verify } from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";

dotenv.config();

export const register = async (req: Request, res: Response) => {
  const { email, phone, nickName, password } = req.body;

  try {
    const emailVerification = req.session.verifiedEmail;

    if (!emailVerification) {
      res.status(400).json({ error: "이메일 인증을 완료해야 합니다!" });
    }

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

export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  const token = sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  const verificationUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

  const templatePath = path.join(
    __dirname,
    "../lib/verificationMailTemplate.html"
  );

  const html = await fs.readFile(templatePath, "utf8");

  const emailHtml = html.replace("{{verificationUrl}}", verificationUrl);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: '"나들이" <your-email@gmail.com>',
    to: email,
    subject: "나들이 이메일 인증",
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Error sending verification email" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ error: "Token is required" });
  }

  try {
    const decoded = verify(token as string, process.env.JWT_SECRET as string);
    const email = (decoded as { email: string }).email;

    req.session.verifiedEmail = email;

    res.status(200).json({ message: "Email verified successfully", email });
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};
