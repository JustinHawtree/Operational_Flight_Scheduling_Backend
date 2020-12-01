import { Router } from "express";
import csvController from "../controllers/csvController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one flight
router.get("/", [], csvController.getCSV);

export default router;