import type { Express } from "express";

import GetCurrentUser from "../../../application/usecase/auth/GetCurrentUser.js";
import LoginUser from "../../../application/usecase/auth/LoginUser.js";
import RegisterUser from "../../../application/usecase/auth/RegisterUser.js";
import RequestPasswordReset from "../../../application/usecase/auth/RequestPasswordReset.js";
import ResetPassword from "../../../application/usecase/auth/ResetPassword.js";
import { createEmailService } from "../../../infrastructure/email/createEmailService.js";
import PostgresAuthTokenRepository from "../../../infrastructure/repository/PostgresAuthTokenRepository.js";
import PostgresUserRepository from "../../../infrastructure/repository/PostgresUserRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseForgotPasswordBody } from "../validation/parseForgotPasswordBody.js";
import { parseLoginBody } from "../validation/parseLoginBody.js";
import { parseRegisterBody } from "../validation/parseRegisterBody.js";
import { parseResetPasswordBody } from "../validation/parseResetPasswordBody.js";

const userRepository = new PostgresUserRepository();
const authTokenRepository = new PostgresAuthTokenRepository();
const emailService = createEmailService();
const loginUser = new LoginUser(userRepository);
const registerUser = new RegisterUser(userRepository);
const requestPasswordReset = new RequestPasswordReset(
  userRepository,
  authTokenRepository,
  emailService,
);
const resetPassword = new ResetPassword(userRepository, authTokenRepository);
const getCurrentUser = new GetCurrentUser(userRepository);

export function registerAuthRoutes(app: Express): void {
  app.post(
    "/api/v1/auth/login",
    asyncHandler(async (req, res) => {
      const input = parseLoginBody(req.body);
      const result = await loginUser.execute(input);

      res.json(result);
    }),
  );

  app.post(
    "/api/v1/auth/register",
    asyncHandler(async (req, res) => {
      const input = parseRegisterBody(req.body);
      const result = await registerUser.execute(input);

      res.status(201).json(result);
    }),
  );

  app.post(
    "/api/v1/auth/forgot-password",
    asyncHandler(async (req, res) => {
      const input = parseForgotPasswordBody(req.body);
      const result = await requestPasswordReset.execute(input);

      res.json(result);
    }),
  );

  app.post(
    "/api/v1/auth/reset-password",
    asyncHandler(async (req, res) => {
      const input = parseResetPasswordBody(req.body);
      const result = await resetPassword.execute(input);

      res.json(result);
    }),
  );

  app.get(
    "/api/v1/auth/me",
    asyncHandler(async (req, res) => {
      const user = await getCurrentUser.execute(requireAuth(req).userId);

      res.json(user);
    }),
  );
}
