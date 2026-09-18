import type { NextFunction, Request, Response } from "express";

import JwtService from "../../../infrastructure/auth/JwtService.js";
import { authenticate, isPublicPath } from "./authenticate.js";

describe("authenticate middleware", () => {
  it("allows public health path", () => {
    expect(isPublicPath("GET", "/api/v1/health")).toBe(true);
    expect(isPublicPath("POST", "/api/v1/auth/login")).toBe(true);
    expect(isPublicPath("POST", "/api/v1/auth/register")).toBe(true);
    expect(isPublicPath("POST", "/api/v1/auth/forgot-password")).toBe(true);
    expect(isPublicPath("POST", "/api/v1/auth/reset-password")).toBe(true);
    expect(isPublicPath("GET", "/api/v1/dashboard")).toBe(false);
  });

  it("attaches auth context for valid bearer token", () => {
    const token = JwtService.sign({
      sub: "user-1",
      role: "PLAYER",
      characterId: "char-1",
    });

    const req = {
      method: "GET",
      path: "/api/v1/character",
      headers: { authorization: `Bearer ${token}` },
    } as Request;

    let nextArg: unknown;
    const next: NextFunction = (error) => {
      nextArg = error;
    };

    authenticate(req, {} as Response, next);

    expect(req.auth).toEqual({
      userId: "user-1",
      role: "PLAYER",
      characterId: "char-1",
    });
    expect(nextArg).toBeUndefined();
  });
});
