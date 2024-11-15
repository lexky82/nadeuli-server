import { Router } from "express";
import {
  editProfile,
  getProfile,
  uploadMiddleware,
} from "../controllers/profile";

const router = Router();

router.post("/profile", getProfile);
router.patch("/edit-profile/:email", uploadMiddleware, editProfile);

export default router;
