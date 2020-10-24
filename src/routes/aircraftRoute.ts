import { Router } from "express";
import aircraftController from "../controllers/aircraftController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one aircraft
router.get("/:id", [checkJwt, checkRole(["Admin"])], aircraftController.getOneById);

// Get all aircrafts
router.get("/", [checkJwt, checkRole(["Admin"])], aircraftController.getAllAircrafts);

// Create an aircraft
// router.post("/")

// Replace an aircraft
router.put("/:id", [checkJwt, checkRole(["Admin"])], aircraftController.replaceAircraft);

// Edit an aircraft
router.patch("/:id", [checkJwt, checkRole(["Admin"])], aircraftController.editAircraft);

// Delete an aircrft
router.delete("/:id", [checkJwt, checkRole(["Admin"])], aircraftController.removeAircraft);

export default router;