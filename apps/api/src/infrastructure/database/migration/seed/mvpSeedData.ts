export const SEED_CHARACTER_ID = "00000000-0000-4000-8000-000000000101";
export const SEED_STREAK_ID = "00000000-0000-4000-8000-000000000102";

type SeedCategory = {
  id: string;
  name: string;
  displayOrder: number;
  skills: string[];
};

function seedUuid(sequence: number): string {
  const suffix = sequence.toString(16).padStart(12, "0");

  return `00000000-0000-4000-8000-${suffix}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SEED_CATEGORIES: SeedCategory[] = [
  {
    id: seedUuid(1),
    name: "Backend",
    displayOrder: 0,
    skills: [
      "Node.js",
      "TypeScript",
      "Express",
      "APIs",
      "Testes",
      "Redis",
      "Mensageria",
    ],
  },
  {
    id: seedUuid(2),
    name: "Arquitetura",
    displayOrder: 1,
    skills: [
      "Clean Architecture",
      "DDD",
      "SOLID",
      "Design Patterns",
      "Event-driven",
      "System Design",
    ],
  },
  {
    id: seedUuid(3),
    name: "DevOps",
    displayOrder: 2,
    skills: [
      "Linux",
      "Docker",
      "GitHub Actions",
      "CI/CD",
      "AWS",
      "Observabilidade",
      "Infrastructure as Code",
    ],
  },
  {
    id: seedUuid(4),
    name: "Database",
    displayOrder: 3,
    skills: ["PostgreSQL", "SQL", "Indexes", "Transactions", "Performance", "Redis"],
  },
  {
    id: seedUuid(5),
    name: "Engineering",
    displayOrder: 4,
    skills: ["Debugging", "Code Review", "Refactoring", "Segurança", "Performance"],
  },
  {
    id: seedUuid(6),
    name: "Soft Skills",
    displayOrder: 5,
    skills: ["Daily", "Comunicação", "Estimativas", "Apresentação", "Liderança"],
  },
  {
    id: seedUuid(7),
    name: "English",
    displayOrder: 6,
    skills: ["Reading", "Listening", "Speaking", "Technical English"],
  },
];

type SeedAchievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rewardXp: number;
};

const SEED_ACHIEVEMENTS: SeedAchievement[] = [
  {
    id: seedUuid(201),
    slug: "first-node-endpoint",
    name: "First Node Endpoint",
    description: "Ship your first Node.js HTTP endpoint.",
    category: "Backend",
    rewardXp: 25,
  },
  {
    id: seedUuid(202),
    slug: "first-unit-test",
    name: "First Unit Test",
    description: "Write your first automated unit test.",
    category: "Backend",
    rewardXp: 25,
  },
  {
    id: seedUuid(203),
    slug: "first-pr",
    name: "First Pull Request",
    description: "Open your first pull request with evidence.",
    category: "Backend",
    rewardXp: 25,
  },
  {
    id: seedUuid(204),
    slug: "first-refactor",
    name: "First Significant Refactor",
    description: "Refactor a meaningful part of the codebase.",
    category: "Engineering",
    rewardXp: 50,
  },
  {
    id: seedUuid(205),
    slug: "first-dockerfile",
    name: "First Dockerfile",
    description: "Containerize an application with Docker.",
    category: "DevOps",
    rewardXp: 25,
  },
  {
    id: seedUuid(206),
    slug: "first-docker-compose",
    name: "First Docker Compose",
    description: "Orchestrate services with Docker Compose.",
    category: "DevOps",
    rewardXp: 25,
  },
  {
    id: seedUuid(207),
    slug: "first-github-actions",
    name: "First GitHub Actions",
    description: "Automate a workflow with GitHub Actions.",
    category: "DevOps",
    rewardXp: 25,
  },
  {
    id: seedUuid(208),
    slug: "first-deploy",
    name: "First Deploy",
    description: "Deploy an application to a real environment.",
    category: "DevOps",
    rewardXp: 50,
  },
  {
    id: seedUuid(209),
    slug: "first-health-check",
    name: "First Health Check",
    description: "Expose a health endpoint for an API or service.",
    category: "DevOps",
    rewardXp: 25,
  },
  {
    id: seedUuid(210),
    slug: "clean-architecture",
    name: "Clean Architecture",
    description: "Apply Clean Architecture in a real project.",
    category: "Arquitetura",
    rewardXp: 50,
  },
];

let skillSequence = 1000;

function nextSkillId(): string {
  skillSequence += 1;

  return seedUuid(skillSequence);
}

export function getSeedCategoryCount(): number {
  return SEED_CATEGORIES.length;
}

export function getSeedSkillCount(): number {
  return SEED_CATEGORIES.reduce((total, category) => total + category.skills.length, 0);
}

export function getSeedAchievementCount(): number {
  return SEED_ACHIEVEMENTS.length;
}

export function getSeedSkillSlugs(): string[] {
  const slugs: string[] = [];
  const usedSlugs = new Set<string>();

  for (const category of SEED_CATEGORIES) {
    for (const skillName of category.skills) {
      slugs.push(buildSkillSlug(category.name, skillName, usedSlugs));
    }
  }

  return slugs;
}

function buildSkillSlug(
  categoryName: string,
  skillName: string,
  usedSlugs: Set<string>,
): string {
  const baseSlug = slugify(skillName);

  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);

    return baseSlug;
  }

  const prefixedSlug = `${slugify(categoryName)}-${baseSlug}`;
  usedSlugs.add(prefixedSlug);

  return prefixedSlug;
}

export function buildMvpSeedSql(): string {
  const categoryValues = SEED_CATEGORIES.map(
    (category) =>
      `('${category.id}', '${escapeSql(category.name)}', ${category.displayOrder})`,
  ).join(",\n  ");

  const skillValues: string[] = [];
  const characterSkillValues: string[] = [];
  let characterSkillSequence = 3000;
  const usedSlugs = new Set<string>();

  for (const category of SEED_CATEGORIES) {
    category.skills.forEach((skillName, index) => {
      const skillId = nextSkillId();
      const characterSkillId = seedUuid(characterSkillSequence);
      characterSkillSequence += 1;
      const skillSlug = buildSkillSlug(category.name, skillName, usedSlugs);

      skillValues.push(
        `('${skillId}', '${category.id}', '${escapeSql(skillName)}', '${skillSlug}', ${index})`,
      );
      characterSkillValues.push(
        `('${characterSkillId}', '${SEED_CHARACTER_ID}', '${skillId}', 0, 'UNKNOWN', FALSE)`,
      );
    });
  }

  const achievementValues = SEED_ACHIEVEMENTS.map(
    (achievement) =>
      `('${achievement.id}', '${achievement.slug}', '${escapeSql(achievement.name)}', '${escapeSql(achievement.description)}', '${escapeSql(achievement.category)}', ${achievement.rewardXp}, 'MANUAL', '{}'::jsonb)`,
  ).join(",\n  ");

  return `
INSERT INTO characters (
  id,
  name,
  character_class,
  specialization,
  subclass,
  career_goal,
  current_rank,
  total_xp
) VALUES (
  '${SEED_CHARACTER_ID}',
  'Leone',
  'Backend Developer',
  'Node.js / TypeScript',
  'DevOps',
  'Senior Backend Developer + DevOps',
  'Pleno',
  0
);

INSERT INTO streaks (
  id,
  character_id,
  current_count,
  best_count,
  last_activity_date,
  bonuses_claimed
) VALUES (
  '${SEED_STREAK_ID}',
  '${SEED_CHARACTER_ID}',
  0,
  0,
  NULL,
  '[]'::jsonb
);

INSERT INTO skill_categories (id, name, display_order) VALUES
  ${categoryValues};

INSERT INTO skills (id, category_id, name, slug, display_order) VALUES
  ${skillValues.join(",\n  ")};

INSERT INTO character_skills (
  id,
  character_id,
  skill_id,
  xp,
  mastery_level,
  mastery_overridden
) VALUES
  ${characterSkillValues.join(",\n  ")};

INSERT INTO achievements (
  id,
  slug,
  name,
  description,
  category,
  reward_xp,
  condition_type,
  condition_value
) VALUES
  ${achievementValues};
`;
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}
