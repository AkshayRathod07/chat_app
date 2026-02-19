import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  validateRequest,
  authController.register,
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  validateRequest,
  authController.login,
);

router.get("/me", protect, authController.me);

export default router;
