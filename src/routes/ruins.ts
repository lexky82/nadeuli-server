import { Router } from "express";
import {
  autoComplete,
  getLocations,
  getRuinsInformation,
} from "../controllers/ruins";

const router = Router();

router.get("/locations", getLocations);
router.get("/ruinsInfo/:ruinsId", getRuinsInformation);
router.get("/autocomplete", autoComplete);

export default router;
