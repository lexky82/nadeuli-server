import { Router } from "express";
import authRoutes from "./auth";
import profileRoutes from "./profile";

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.use("/authentication", authRoutes);
router.use("/profile", profileRoutes);

export default router;
