const migration = `
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  character_class VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  subclass VARCHAR(100),
  career_goal VARCHAR(255),
  current_rank VARCHAR(100),
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE skill_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL CHECK (display_order >= 0)
);

CREATE TABLE skills (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL CHECK (display_order >= 0)
);

CREATE TABLE character_skills (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  mastery_level VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  mastery_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  last_xp_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (character_id, skill_id)
);

CREATE TABLE quests (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  base_xp INTEGER NOT NULL CHECK (base_xp > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'TODO',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quest_skill_allocations (
  id UUID PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
  UNIQUE (quest_id, skill_id)
);

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source_type VARCHAR(30) NOT NULL,
  source_id UUID,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evidences (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  condition_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
  condition_value JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE achievement_unlocks (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE RESTRICT,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_id UUID REFERENCES evidences(id) ON DELETE SET NULL,
  UNIQUE (character_id, achievement_id)
);

CREATE TABLE streaks (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  best_count INTEGER NOT NULL DEFAULT 0 CHECK (best_count >= 0),
  last_activity_date DATE,
  bonuses_claimed JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_character_created_at
  ON xp_transactions (character_id, created_at DESC);

CREATE INDEX idx_quests_character_status_type
  ON quests (character_id, status, type);

CREATE INDEX idx_quests_character_created_at
  ON quests (character_id, created_at DESC);

CREATE INDEX idx_character_skills_character_last_xp_at
  ON character_skills (character_id, last_xp_at);

CREATE INDEX idx_evidences_entity
  ON evidences (entity_type, entity_id);
`;

export default migration;
