import { Router } from "express";
import CrewPositionController from "../controllers/crewPositionController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get one Crew Position
router.get("/:uuid", [checkJwt, checkRole(["Admin", "Scheduler"])], CrewPositionController.getOneByUUID);

// Get all Crew Positions
router.get("/", [checkJwt, checkRole(["Admin", "Scheduler"])], CrewPositionController.getAllCrewPositions);

// Create a Crew Position
router.post("/", [checkJwt, checkRole(["Admin"])], CrewPositionController.createCrewPosition);

// Replace a Crew Position
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], CrewPositionController.replaceCrewPosition);

// Edit a Crew Position
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], CrewPositionController.editCrewPosition);

// Delete a Crew Position
router.delete("/:uuid", [checkJwt, checkRole(["Admin"])], CrewPositionController.removeCrewPosition);

export default router;