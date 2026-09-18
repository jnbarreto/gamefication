import { buildSkillParentBackfillSql } from "../seed/skillParentBySlug.js";

const migration = `
ALTER TABLE skills
  ADD COLUMN description TEXT,
  ADD COLUMN parent_skill_id UUID REFERENCES skills(id) ON DELETE RESTRICT,
  ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_skills_parent_skill_id ON skills (parent_skill_id);

${buildSkillParentBackfillSql()}
`;

export default migration;
