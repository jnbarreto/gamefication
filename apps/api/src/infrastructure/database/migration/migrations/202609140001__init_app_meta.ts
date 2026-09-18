const migration = `
CREATE TABLE app_meta (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_meta (key, value) VALUES ('migration_runner', 'ready');
`;

export default migration;
