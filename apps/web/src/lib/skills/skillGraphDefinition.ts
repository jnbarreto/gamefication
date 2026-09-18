export type SkillGraphNodeKind = "category" | "skill";

export type SkillGraphNodeDef = {
  id: string;
  slug?: string;
  label: string;
  kind: SkillGraphNodeKind;
  children: string[];
};

export type SkillGraphTreeDef = {
  categoryName: string;
  rootId: string;
  nodes: Record<string, SkillGraphNodeDef>;
};

function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryKeyFromName(name: string): string {
  return slugifyCategoryName(name);
}

export const SKILL_GRAPH_TREES: SkillGraphTreeDef[] = [
  {
    categoryName: "Backend",
    rootId: "backend-root",
    nodes: {
      "backend-root": {
        id: "backend-root",
        label: "Backend",
        kind: "category",
        children: ["node-js", "apis", "testes", "redis"],
      },
      "node-js": {
        id: "node-js",
        slug: "node-js",
        label: "Node.js",
        kind: "skill",
        children: ["typescript", "express", "mensageria"],
      },
      typescript: {
        id: "typescript",
        slug: "typescript",
        label: "TypeScript",
        kind: "skill",
        children: [],
      },
      express: {
        id: "express",
        slug: "express",
        label: "Express",
        kind: "skill",
        children: [],
      },
      mensageria: {
        id: "mensageria",
        slug: "mensageria",
        label: "Mensageria",
        kind: "skill",
        children: [],
      },
      apis: { id: "apis", slug: "apis", label: "APIs", kind: "skill", children: [] },
      testes: {
        id: "testes",
        slug: "testes",
        label: "Testes",
        kind: "skill",
        children: [],
      },
      redis: { id: "redis", slug: "redis", label: "Redis", kind: "skill", children: [] },
    },
  },
  {
    categoryName: "Arquitetura",
    rootId: "arquitetura-root",
    nodes: {
      "arquitetura-root": {
        id: "arquitetura-root",
        label: "Arquitetura",
        kind: "category",
        children: ["clean-architecture", "event-driven", "system-design"],
      },
      "clean-architecture": {
        id: "clean-architecture",
        slug: "clean-architecture",
        label: "Clean Architecture",
        kind: "skill",
        children: ["ddd", "solid", "design-patterns"],
      },
      ddd: { id: "ddd", slug: "ddd", label: "DDD", kind: "skill", children: [] },
      solid: { id: "solid", slug: "solid", label: "SOLID", kind: "skill", children: [] },
      "design-patterns": {
        id: "design-patterns",
        slug: "design-patterns",
        label: "Design Patterns",
        kind: "skill",
        children: [],
      },
      "event-driven": {
        id: "event-driven",
        slug: "event-driven",
        label: "Event-driven",
        kind: "skill",
        children: [],
      },
      "system-design": {
        id: "system-design",
        slug: "system-design",
        label: "System Design",
        kind: "skill",
        children: [],
      },
    },
  },
  {
    categoryName: "DevOps",
    rootId: "devops-root",
    nodes: {
      "devops-root": {
        id: "devops-root",
        label: "DevOps",
        kind: "category",
        children: ["linux", "aws", "observabilidade", "infrastructure-as-code"],
      },
      linux: {
        id: "linux",
        slug: "linux",
        label: "Linux",
        kind: "skill",
        children: ["docker"],
      },
      docker: {
        id: "docker",
        slug: "docker",
        label: "Docker",
        kind: "skill",
        children: ["github-actions", "ci-cd"],
      },
      "github-actions": {
        id: "github-actions",
        slug: "github-actions",
        label: "GitHub Actions",
        kind: "skill",
        children: [],
      },
      "ci-cd": {
        id: "ci-cd",
        slug: "ci-cd",
        label: "CI/CD",
        kind: "skill",
        children: [],
      },
      aws: { id: "aws", slug: "aws", label: "AWS", kind: "skill", children: [] },
      observabilidade: {
        id: "observabilidade",
        slug: "observabilidade",
        label: "Observabilidade",
        kind: "skill",
        children: [],
      },
      "infrastructure-as-code": {
        id: "infrastructure-as-code",
        slug: "infrastructure-as-code",
        label: "Infrastructure as Code",
        kind: "skill",
        children: [],
      },
    },
  },
  {
    categoryName: "Database",
    rootId: "database-root",
    nodes: {
      "database-root": {
        id: "database-root",
        label: "Database",
        kind: "category",
        children: ["postgresql", "database-redis"],
      },
      postgresql: {
        id: "postgresql",
        slug: "postgresql",
        label: "PostgreSQL",
        kind: "skill",
        children: ["sql", "indexes", "transactions", "performance"],
      },
      sql: { id: "sql", slug: "sql", label: "SQL", kind: "skill", children: [] },
      indexes: {
        id: "indexes",
        slug: "indexes",
        label: "Indexes",
        kind: "skill",
        children: [],
      },
      transactions: {
        id: "transactions",
        slug: "transactions",
        label: "Transactions",
        kind: "skill",
        children: [],
      },
      performance: {
        id: "performance",
        slug: "performance",
        label: "Performance",
        kind: "skill",
        children: [],
      },
      "database-redis": {
        id: "database-redis",
        slug: "database-redis",
        label: "Redis",
        kind: "skill",
        children: [],
      },
    },
  },
  {
    categoryName: "Engineering",
    rootId: "engineering-root",
    nodes: {
      "engineering-root": {
        id: "engineering-root",
        label: "Engineering",
        kind: "category",
        children: [
          "debugging",
          "code-review",
          "refactoring",
          "seguran-a",
          "engineering-performance",
        ],
      },
      debugging: {
        id: "debugging",
        slug: "debugging",
        label: "Debugging",
        kind: "skill",
        children: [],
      },
      "code-review": {
        id: "code-review",
        slug: "code-review",
        label: "Code Review",
        kind: "skill",
        children: [],
      },
      refactoring: {
        id: "refactoring",
        slug: "refactoring",
        label: "Refactoring",
        kind: "skill",
        children: [],
      },
      "seguran-a": {
        id: "seguran-a",
        slug: "seguran-a",
        label: "Segurança",
        kind: "skill",
        children: [],
      },
      "engineering-performance": {
        id: "engineering-performance",
        slug: "engineering-performance",
        label: "Performance",
        kind: "skill",
        children: [],
      },
    },
  },
  {
    categoryName: "Soft Skills",
    rootId: "soft-skills-root",
    nodes: {
      "soft-skills-root": {
        id: "soft-skills-root",
        label: "Soft Skills",
        kind: "category",
        children: ["daily", "comunica-o", "estimativas", "apresenta-o", "lideran-a"],
      },
      daily: { id: "daily", slug: "daily", label: "Daily", kind: "skill", children: [] },
      "comunica-o": {
        id: "comunica-o",
        slug: "comunica-o",
        label: "Comunicação",
        kind: "skill",
        children: [],
      },
      estimativas: {
        id: "estimativas",
        slug: "estimativas",
        label: "Estimativas",
        kind: "skill",
        children: [],
      },
      "apresenta-o": {
        id: "apresenta-o",
        slug: "apresenta-o",
        label: "Apresentação",
        kind: "skill",
        children: [],
      },
      "lideran-a": {
        id: "lideran-a",
        slug: "lideran-a",
        label: "Liderança",
        kind: "skill",
        children: [],
      },
    },
  },
  {
    categoryName: "English",
    rootId: "english-root",
    nodes: {
      "english-root": {
        id: "english-root",
        label: "English",
        kind: "category",
        children: ["reading", "listening", "speaking", "technical-english"],
      },
      reading: {
        id: "reading",
        slug: "reading",
        label: "Reading",
        kind: "skill",
        children: ["technical-english"],
      },
      listening: {
        id: "listening",
        slug: "listening",
        label: "Listening",
        kind: "skill",
        children: [],
      },
      speaking: {
        id: "speaking",
        slug: "speaking",
        label: "Speaking",
        kind: "skill",
        children: [],
      },
      "technical-english": {
        id: "technical-english",
        slug: "technical-english",
        label: "Technical English",
        kind: "skill",
        children: [],
      },
    },
  },
];

export function findGraphTreeForCategory(categoryName: string): SkillGraphTreeDef | undefined {
  return SKILL_GRAPH_TREES.find((tree) => tree.categoryName === categoryName);
}
