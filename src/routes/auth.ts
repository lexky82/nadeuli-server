import { Router } from "express";
import { register } from "../controlleres/auth";

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.post("/register", register);

export default router;
