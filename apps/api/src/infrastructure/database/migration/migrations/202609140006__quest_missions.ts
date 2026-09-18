const migration = `
CREATE TABLE quest_missions (
  id UUID PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quest_missions_quest_id ON quest_missions (quest_id);
`;

export default migration;
