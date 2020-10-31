import { Router } from "express";
import AircraftModelController from "../controllers/aircraftModelController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one aircraft model
router.get("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftModelController.getOneByUUID);

// Get all aircraft models
router.get("/", [checkJwt, checkRole(["Admin"])], AircraftModelController.getAllAircraftModels);

// Create an aircraft model
router.post("/", [checkJwt, checkRole(["Admin"])], AircraftModelController.createAircraftModel);

// Replace an aircraft model
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftModelController.replaceAircraftModel);

// Edit an aircraft model
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftModelController.editAircraftModel);

// Delete an aircrft model
router.delete("/:uuid", [checkJwt, checkRole(["Admin"])], AircraftModelController.removeAircraftModel);

export default router;