const migration = `
UPDATE quests
SET type = 'WORK'
WHERE type = 'CAREER';

ALTER TABLE quests
  ADD COLUMN calendar_week_start DATE;

UPDATE quests
SET calendar_week_start = date_trunc('week', created_at::timestamp)::date
WHERE type = 'WEEKLY';

CREATE INDEX idx_quests_weekly_calendar_week_start
  ON quests (character_id, calendar_week_start)
  WHERE type = 'WEEKLY';
`;

export default migration;
