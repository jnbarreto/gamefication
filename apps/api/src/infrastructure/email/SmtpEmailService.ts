import nodemailer from "nodemailer";

import type EmailService from "../../application/service/EmailService.js";
import type { PasswordResetEmailInput } from "../../application/service/EmailService.js";
import { getEmailConfig } from "../config/emailConfig.js";
import InfraError from "../exception/InfraError.js";

export default class SmtpEmailService implements EmailService {
  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
    const config = getEmailConfig();

    if (!config.smtpHost) {
      throw new InfraError("SMTP is not configured");
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth:
        config.smtpUser && config.smtpPass
          ? {
              user: config.smtpUser,
              pass: config.smtpPass,
            }
          : undefined,
    });

    try {
      await transporter.sendMail({
        from: config.fromAddress,
        to: input.to,
        subject: "Redefinição de senha — Developer RPG",
        text: [
          "Recebemos um pedido para redefinir sua senha.",
          "",
          `Acesse o link abaixo (válido por 1 hora):`,
          input.resetUrl,
          "",
          "Se você não solicitou isso, ignore este e-mail.",
        ].join("\n"),
        html: `
          <p>Recebemos um pedido para redefinir sua senha.</p>
          <p><a href="${input.resetUrl}">Redefinir senha</a></p>
          <p>O link expira em 1 hora.</p>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
        `,
      });
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to send password reset email",
      );
    }
  }
}
