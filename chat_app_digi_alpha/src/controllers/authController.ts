import { Request, Response } from "express";
import * as authService from "../services/authService";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const result = await authService.registerUser(email, password);
    return res.status(201).json(result);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message || "Registration error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const result = await authService.loginUser(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Login error" });
  }
}

export async function me(req: Request, res: Response) {
  // `req.user` is set by middleware
  // Type cast to any for simplicity
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ user });
}
