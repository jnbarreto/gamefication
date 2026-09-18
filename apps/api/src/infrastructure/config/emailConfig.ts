export type EmailConfig = {
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpSecure: boolean;
  fromAddress: string;
  appWebUrl: string;
};

export function getEmailConfig(): EmailConfig {
  const smtpHost = process.env.SMTP_HOST?.trim() || null;

  return {
    smtpHost,
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER?.trim() || null,
    smtpPass: process.env.SMTP_PASS?.trim() || null,
    smtpSecure: process.env.SMTP_SECURE === "true",
    fromAddress: process.env.SMTP_FROM ?? "noreply@gamefication.local",
    appWebUrl: process.env.APP_WEB_URL ?? "http://localhost:5173",
  };
}

export function isSmtpConfigured(): boolean {
  return getEmailConfig().smtpHost !== null;
}
