const migration = `
ALTER TABLE skill_categories
  ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT FALSE;
`;

export default migration;
