import { Router } from "express";
import * as authController from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);

export default router;
