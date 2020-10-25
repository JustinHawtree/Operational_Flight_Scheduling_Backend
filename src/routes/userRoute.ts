import { Router } from "express";
import userController from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();


// Get Non-Approved Users
router.get("/approval", [checkJwt, checkRole(["Admin"])], userController.getNonApprovedUsers);

// Get Pilots
router.get("/pilots", [checkJwt, checkRole(["Admin"])], userController.getPilots); 

// Get one user
router.get("/:id", [checkJwt, checkRole(["Admin"])], userController.getOneById);

// Get all users
router.get("/", [checkJwt, checkRole(["Admin"])], userController.getAllUsers);

// TODO: Might want an admin to be put to make a new account?
// Create a new user
// router.post("/")

// Replace one user
router.put("/:id", [checkJwt, checkRole(["Admin"])], userController.replaceUser);

// Edit one user
router.patch("/:id", [checkJwt, checkRole(["Admin"])], userController.editUser);

export default router;