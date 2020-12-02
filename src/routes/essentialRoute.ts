import { Router } from "express";
import EssentialController from "../controllers/essentialController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

// Get one aircraft
router.get("/", [checkJwt], EssentialController.getEssential);

export default router;