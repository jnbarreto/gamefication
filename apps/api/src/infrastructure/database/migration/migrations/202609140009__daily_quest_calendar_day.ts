const migration = `
ALTER TABLE quests
  ADD COLUMN calendar_day DATE;

UPDATE quests
SET calendar_day = created_at::date
WHERE type = 'DAILY';

CREATE INDEX idx_quests_daily_calendar_day
  ON quests (character_id, calendar_day)
  WHERE type = 'DAILY';
`;

export default migration;
