import { Router } from "express";
import authRoutes from "./auth";
import profileRoutes from "./profile";
import ruinsRoutes from "./ruins";

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.use("/authentication", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ruins", ruinsRoutes);

export default router;
