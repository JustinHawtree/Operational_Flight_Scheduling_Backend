import { Router } from "express";
import locationController from "../controllers/locationController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one location
router.get("/:uuid", [checkJwt, checkRole(["Admin"])], locationController.getOneByUUID);

// Get all locations
router.get("/", [checkJwt, checkRole(["Admin"])], locationController.getAllLocations);

// Create a location
router.post("/", [checkJwt, checkRole(["Admin"])], locationController.createLocation);

// Replace a location
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], locationController.replaceLocation);

// Edit a location
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], locationController.editLocation);

// Delete a location
router.delete("/:uuid", [checkJwt, checkRole(["Admin"])], locationController.removeLocation);

export default router;