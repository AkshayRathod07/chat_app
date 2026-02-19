import User from "../src/models/User";
import * as authService from "../src/services/authService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../src/models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("authService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("registerUser throws when user exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ email: "a@b.com" });
    await expect(authService.registerUser("a@b.com", "pw")).rejects.toThrow(
      "User already exists",
    );
  });

  test("loginUser throws on invalid credentials", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    await expect(authService.loginUser("a@b.com", "pw")).rejects.toThrow(
      "Invalid credentials",
    );
  });
});
