import type EmailService from "../../application/service/EmailService.js";
import { isSmtpConfigured } from "../config/emailConfig.js";
import ConsoleEmailService from "./ConsoleEmailService.js";
import SmtpEmailService from "./SmtpEmailService.js";

export function createEmailService(): EmailService {
  if (isSmtpConfigured()) {
    return new SmtpEmailService();
  }

  return new ConsoleEmailService();
}
