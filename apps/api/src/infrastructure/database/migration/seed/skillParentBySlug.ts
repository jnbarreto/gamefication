type ParentTreeNode = {
  slug: string;
  children?: ParentTreeNode[];
};

const PARENT_TREES: ParentTreeNode[][] = [
  [
    {
      slug: "node-js",
      children: [
        { slug: "typescript" },
        { slug: "express" },
        { slug: "mensageria" },
      ],
    },
    { slug: "apis" },
    { slug: "testes" },
    { slug: "redis" },
  ],
  [
    {
      slug: "clean-architecture",
      children: [{ slug: "ddd" }, { slug: "solid" }, { slug: "design-patterns" }],
    },
    { slug: "event-driven" },
    { slug: "system-design" },
  ],
  [
    {
      slug: "linux",
      children: [
        {
          slug: "docker",
          children: [{ slug: "github-actions" }, { slug: "ci-cd" }],
        },
      ],
    },
    { slug: "aws" },
    { slug: "observabilidade" },
    { slug: "infrastructure-as-code" },
  ],
  [
    {
      slug: "postgresql",
      children: [
        { slug: "sql" },
        { slug: "indexes" },
        { slug: "transactions" },
        { slug: "performance" },
      ],
    },
    { slug: "database-redis" },
  ],
  [
    { slug: "debugging" },
    { slug: "code-review" },
    { slug: "refactoring" },
    { slug: "seguran-a" },
    { slug: "engineering-performance" },
  ],
  [
    { slug: "daily" },
    { slug: "comunica-o" },
    { slug: "estimativas" },
    { slug: "apresenta-o" },
    { slug: "lideran-a" },
  ],
  [
    {
      slug: "reading",
      children: [{ slug: "technical-english" }],
    },
    { slug: "listening" },
    { slug: "speaking" },
  ],
];

function collectParentSlugs(
  nodes: ParentTreeNode[],
  parentSlug: string | null,
  output: Record<string, string | null>,
): void {
  for (const node of nodes) {
    output[node.slug] = parentSlug;

    if (node.children?.length) {
      collectParentSlugs(node.children, node.slug, output);
    }
  }
}

export const SKILL_PARENT_BY_SLUG: Record<string, string | null> = {};

for (const tree of PARENT_TREES) {
  collectParentSlugs(tree, null, SKILL_PARENT_BY_SLUG);
}

export function buildSkillParentBackfillSql(): string {
  const statements = Object.entries(SKILL_PARENT_BY_SLUG).map(([slug, parentSlug]) => {
    if (parentSlug === null) {
      return `
        UPDATE skills AS child
        SET parent_skill_id = NULL
        WHERE child.slug = '${slug}';
      `;
    }

    return `
      UPDATE skills AS child
      SET parent_skill_id = parent.id
      FROM skills AS parent
      WHERE child.slug = '${slug}'
        AND parent.slug = '${parentSlug}';
    `;
  });

  return statements.join("\n");
}
