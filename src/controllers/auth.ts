import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { sign, verify } from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import axios from "axios";

dotenv.config();

const fetchProfile = async (name: string) => {
  try {
    const response = await axios.get(
      `https://api.dicebear.com/9.x/glass/jpeg?seed=${name}&radius=50`
    );
    const profileData = response.data;

    return profileData;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  try {
    if (!req.session.verifiedEmail) {
      res.status(400).json({ message: "이메일 인증을 완료해야 합니다!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    req.session.verifiedEmail = undefined;

    const dirPath = path.join("public", "uploads", "users", email);
    const filePath = path.join(dirPath, "profile.jpeg");

    fs.mkdir(dirPath, { recursive: true })
      .then(async () => {
        fs.writeFile(filePath, await fetchProfile(name)).catch((err) => {
          throw new Error(err);
        });
      })
      .catch((err) => {
        throw new Error(err);
      });

    res
      .status(201)
      .json({ message: "회원가입을 성공하였습니다.", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "존재하지 않는 이메일입니다." });
      return;
    }

    const isMatch = await bcrypt.compare(
      password,
      user?.dataValues.password as string
    );

    if (!isMatch) {
      res.status(400).json({ message: "잘못된 비밀번호입니다." });
      return;
    }

    const accessToken = sign(
      { id: user.id, email: user?.dataValues.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const refreshToken = sign(
      { id: user.id, email: user?.dataValues.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      sameSite: "lax",
    });

    res.status(200).json({
      ...user.dataValues,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "로그인 실패", error });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "리프레시 토큰이 없습니다." });
    return;
  }

  try {
    const decoded = verify(refreshToken, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
    };

    const accessToken = sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res
      .status(403)
      .json({ message: "유효하지 않은 리프레시 토큰입니다.", error });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "로그아웃 성공" });
};

export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ where: { email: email } });

  if (existingUser) {
    res.status(409).json({ message: "이미 존재하는 사용자입니다." });
    return;
  }

  const token = sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  const verificationUrl = `${process.env.CLIENT_URL}/api/authentication/verify-email?token=${token}`;

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
    return;
  }

  try {
    const decoded = verify(token as string, process.env.JWT_SECRET as string);
    const email = (decoded as { email: string }).email;

    req.session.verifiedEmail = email;

    res.send(`
    <html>
      <body>
        <script>
          alert('이메일 인증이 완료되었습니다.');
          window.close();
        </script>
      </body>
    </html>
  `);
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(400).send(`
      <html>
        <body>
          <script>
            alert('이메일 인증에 실패했습니다. 다시 시도해주세요.');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
};

export const isValidEmail = async (req: Request, res: Response) => {
  const { email } = req.query;

  try {
    if (req.session.verifiedEmail !== email) {
      new Error("인증받지 않는 이메일입니다.");
      return;
    }

    res.status(200).json({ message: "인증이 완료된 이메일입니다.", email });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error, email });
  }
};

export const checkUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "이메일이 없습니다." });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: "1h",
      });

      const verificationUrl = `${process.env.CLIENT_URL}/api/authentication/verify-email?token=${token}`;

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

      res.status(200);
    } else {
      res.status(404).json({ message: "존재하지 않는 사용자입니다." });
    }
  } catch (error) {
    res.status(500).json({ message: "존재하지 않는 이메일입니다.", error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ message: "Email and new password are required" });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();
    req.session.verifiedEmail = undefined;

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
};
