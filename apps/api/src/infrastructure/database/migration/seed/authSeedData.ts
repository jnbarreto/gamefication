import PasswordHasher from "../../../auth/PasswordHasher.js";
import { getAuthConfig } from "../../../config/authConfig.js";
import { SEED_CHARACTER_ID } from "./mvpSeedData.js";

export const SEED_ADMIN_USER_ID = "00000000-0000-4000-8000-000000000100";

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildAuthSeedSql(): string {
  const { seedAdminEmail, seedAdminPassword } = getAuthConfig();
  const passwordHash = PasswordHasher.hashDeterministic(
    seedAdminPassword,
    "gamefication:seed:admin",
  );

  return `
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PLAYER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE characters
  ADD COLUMN user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE;

INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role
) VALUES (
  '${SEED_ADMIN_USER_ID}',
  '${escapeSql(seedAdminEmail)}',
  '${passwordHash}',
  'Admin',
  'ADMIN'
);

UPDATE characters
SET user_id = '${SEED_ADMIN_USER_ID}'
WHERE id = '${SEED_CHARACTER_ID}';
`;
}
