import { Router } from "express";
import FlightController from "../controllers/flightController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one flight
router.get("/:uuid", [checkJwt, checkRole(["Admin"])], FlightController.getOneByUUID);

// Get all flights
router.get("/", [checkJwt, checkRole(["Admin"])], FlightController.getAllFlights);

// Create an flight
router.post("/", [checkJwt, checkRole(["Admin"])], FlightController.createFlight);

// Replace an flight
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], FlightController.replaceFlight);

// Edit an flight
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], FlightController.editFlight);

// Delete an flight
router.delete("/:uuid", [checkJwt, checkRole(["Admin"])], FlightController.removeFlight);

export default router;