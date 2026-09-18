const migration = `
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('PASSWORD_RESET')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_type_active
  ON auth_tokens (user_id, type)
  WHERE used_at IS NULL;
`;

export default migration;
