import { Router } from "express";
import AircraftController from "../controllers/aircraftController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get all avaliable aircrafts
router.get("/avaliable", [checkJwt, checkRole(["Admin", "Scheduler"])], AircraftController.getAllAvaliableAircrafts);

// Get one aircraft
router.get("/:uuid", [checkJwt, checkRole(["Admin", "Scheduler"])], AircraftController.getOneByUUID);

// Get all aircrafts
router.get("/", [checkJwt, checkRole(["Admin", "Scheduler"])], AircraftController.getAllAircrafts);

// Create an aircraft
router.post("/", [checkJwt, checkRole(["Admin"])], AircraftController.createAircraft);

// Replace an aircraft
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftController.replaceAircraft);

// Edit an aircraft
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftController.editAircraft);

// Delete an aircraft
router.delete("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftController.removeAircraft);

export default router;