import { Router } from "express";
import AuthController from "../controllers/authController";

const router = Router();

// Login Route
router.post("/login", AuthController.login);

// Signup Router
router.post("/signup", AuthController.signup);

export default router;