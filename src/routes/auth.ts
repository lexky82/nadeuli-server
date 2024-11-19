import { Router } from "express";
import {
  changePassword,
  checkUserByEmail,
  isValidEmail,
  login,
  logout,
  refreshAccessToken,
  register,
  sendEmailVerification,
  verifyEmail,
} from "../controllers/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

//토큰 관련
router.post("/refresh", refreshAccessToken);

// 이메일 인증 관련
router.post("/send-email-verification", sendEmailVerification);
router.get("/verify-email", verifyEmail);
router.get("/is-validEmail", isValidEmail);

router.post("/check-user", checkUserByEmail);
router.patch("/change-password", changePassword);

export default router;
