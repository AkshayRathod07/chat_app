import { Request, Response } from "express";

jest.mock("../src/services/authService");
import * as authService from "../src/services/authService";
import * as authController from "../src/controllers/authController";

describe("authController", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("register returns 201 on success", async () => {
    const req = {
      body: { email: "a@b.com", password: "secret" },
    } as unknown as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status, json } as unknown as Response;

    (authService.registerUser as jest.Mock).mockResolvedValue({
      user: { id: "1", email: "a@b.com" },
      token: "t",
    });

    await authController.register(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      user: { id: "1", email: "a@b.com" },
      token: "t",
    });
  });

  test("login returns 200 on success", async () => {
    const req = {
      body: { email: "a@b.com", password: "secret" },
    } as unknown as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status, json } as unknown as Response;

    (authService.loginUser as jest.Mock).mockResolvedValue({
      user: { id: "1", email: "a@b.com" },
      token: "t",
    });

    await authController.login(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      user: { id: "1", email: "a@b.com" },
      token: "t",
    });
  });
});
