import { Router, Request, Response } from "express";
import authRouter from "./auth";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Chat app is running!" });
});

router.use("/api/auth", authRouter);

export default router;
