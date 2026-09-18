export type AuthConfig = {
  jwtSecret: string;
  jwtExpiresIn: string;
  seedAdminEmail: string;
  seedAdminPassword: string;
};

export function getAuthConfig(): AuthConfig {
  return {
    jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@gamefication.local",
    seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  };
}
