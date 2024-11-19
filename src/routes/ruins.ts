import { Router } from "express";
import { getLocations } from "../controllers/ruins";

const router = Router();

router.get("/locations", getLocations);

export default router;
