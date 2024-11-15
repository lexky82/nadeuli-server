import { Request, Response } from "express";
import User from "../models/User";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: ["id", "name", "email"],
    });

    if (!user) {
      res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadMiddleware = upload.single("profile");

export const editProfile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { email } = req.params;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    if (req.file) {
      const dir = path.join(__dirname, `../../public/uploads/users/${email}`);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const outputPath = path.join(dir, "profile.jpeg");

      try {
        await sharp(req.file.buffer)
          .resize(150, 150, { fit: "cover" })
          .withMetadata()
          .toFormat("jpeg", { quality: 100 })
          .toFile(outputPath);
      } catch (error) {
        console.error("Error converting the image to jpeg:", error);
        res
          .status(500)
          .json({ message: "이미지 변환 중 오류가 발생했습니다." });
        return;
      }
    }

    await user?.update({ name, email });

    res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err });
  }
};
