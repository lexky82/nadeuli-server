import { Router } from "express";
import {
  register,
  sendEmailVerification,
  verifyEmail,
} from "../controllers/auth";

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.post("/register", register);

// 이메일 인증 관련
router.post("/send-email-verification", sendEmailVerification);
router.get("/verify-email", verifyEmail);

export default router;
