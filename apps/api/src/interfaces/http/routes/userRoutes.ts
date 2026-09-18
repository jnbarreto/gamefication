import type { Express } from "express";

import CreateUser from "../../../application/usecase/user/CreateUser.js";
import ListUsers from "../../../application/usecase/user/ListUsers.js";
import UpdateUser from "../../../application/usecase/user/UpdateUser.js";
import PostgresUserRepository from "../../../infrastructure/repository/PostgresUserRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireRole } from "../middleware/requireRole.js";
import { parseCreateUserBody } from "../validation/parseCreateUserBody.js";
import { parseUpdateUserBody } from "../validation/parseUpdateUserBody.js";

const userRepository = new PostgresUserRepository();
const listUsers = new ListUsers(userRepository);
const createUser = new CreateUser(userRepository);
const updateUser = new UpdateUser(userRepository);

export function registerUserRoutes(app: Express): void {
  app.get(
    "/api/v1/users",
    requireRole("ADMIN"),
    asyncHandler(async (_req, res) => {
      const users = await listUsers.execute();

      res.json({ users });
    }),
  );

  app.post(
    "/api/v1/users",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const input = parseCreateUserBody(req.body);
      const user = await createUser.execute(input);

      res.status(201).json(user);
    }),
  );

  app.patch(
    "/api/v1/users/:id",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const input = parseUpdateUserBody(req.body);
      const user = await updateUser.execute({
        userId: req.params.id,
        ...input,
      });

      res.json(user);
    }),
  );
}
