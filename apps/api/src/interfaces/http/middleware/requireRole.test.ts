import type { NextFunction, Request, Response } from "express";

import ForbiddenError from "../../../application/exception/ForbiddenError.js";
import { requireRole } from "./requireRole.js";

describe("requireRole", () => {
  it("allows matching role", () => {
    const req = {
      auth: { userId: "u1", role: "ADMIN", characterId: "c1" },
    } as Request;
    let nextArg: unknown;
    const next: NextFunction = (error) => {
      nextArg = error;
    };

    requireRole("ADMIN")(req, {} as Response, next);

    expect(nextArg).toBeUndefined();
  });

  it("rejects non-admin for admin route", () => {
    const req = {
      auth: { userId: "u1", role: "PLAYER", characterId: "c1" },
    } as Request;
    let nextArg: unknown;
    const next: NextFunction = (error) => {
      nextArg = error;
    };

    requireRole("ADMIN")(req, {} as Response, next);

    expect(nextArg).toBeInstanceOf(ForbiddenError);
  });
});
