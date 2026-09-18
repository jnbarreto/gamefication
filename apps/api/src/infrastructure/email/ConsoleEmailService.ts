import type EmailService from "../../application/service/EmailService.js";
import type { PasswordResetEmailInput } from "../../application/service/EmailService.js";

export default class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
    console.log(
      `[email] password reset for ${input.to}\n  reset link: ${input.resetUrl}`,
    );
  }
}
