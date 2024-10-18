import { Router } from "express";
import authRoutes from "./auth";

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.use("/authentication", authRoutes);

export default router;
