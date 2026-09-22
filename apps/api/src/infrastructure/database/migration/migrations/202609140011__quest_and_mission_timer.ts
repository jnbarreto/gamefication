const migration = `
ALTER TABLE quests
  ADD COLUMN timer_seconds INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN timer_running BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN timer_started_at TIMESTAMPTZ;

ALTER TABLE quest_missions
  ADD COLUMN duration_seconds INTEGER;
`;

export default migration;
