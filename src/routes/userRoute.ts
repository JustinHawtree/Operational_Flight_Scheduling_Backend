import { Router } from "express";
import UserController from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import { approveUsers } from "../services/userService";

const router = Router();


// Get Non-Approved Users
router.get("/nonapproved", [checkJwt, checkRole(["Admin"])], UserController.getNonApprovedUsers);

// Get Pilots
router.get("/pilots", [checkJwt, checkRole(["Admin"])], UserController.getPilots); 

// Get one user
router.get("/:id", [checkJwt, checkRole(["Admin"])], UserController.getOneByUUID);

// Get all users
router.get("/", [checkJwt, checkRole(["Admin"])], UserController.getAllUsers);

// TODO: Might want an admin to be put to make a new account?
// Create a new user
// router.post("/")

// Replace one user
router.put("/:uuid", [checkJwt, checkRole(["Admin"])], UserController.replaceUser);

// Edit one user
router.patch("/:uuid", [checkJwt, checkRole(["Admin"])], UserController.editUser);

// Approve a list of user uuids
router.patch("/approval", [checkJwt, checkRole(["Admin"])], UserController.approveUser);

export default router;