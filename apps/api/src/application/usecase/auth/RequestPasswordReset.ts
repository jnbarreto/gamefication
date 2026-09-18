import Uuid from "../../../domain/shared/Uuid.js";
import type AuthTokenRepository from "../../repository/AuthTokenRepository.js";
import type UserRepository from "../../repository/UserRepository.js";
import type EmailService from "../../service/EmailService.js";
import TokenHasher from "../../../infrastructure/auth/TokenHasher.js";
import { getEmailConfig } from "../../../infrastructure/config/emailConfig.js";

export type RequestPasswordResetInput = {
  email: string;
};

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export default class RequestPasswordReset {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: RequestPasswordResetInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (user) {
      const rawToken = TokenHasher.generateRawToken();
      const tokenHash = TokenHasher.hash(rawToken);
      const now = new Date();

      await this.authTokenRepository.invalidateActiveForUser(
        user.getId().toString(),
        "PASSWORD_RESET",
      );

      await this.authTokenRepository.create({
        id: Uuid.create().toString(),
        userId: user.getId().toString(),
        tokenHash,
        type: "PASSWORD_RESET",
        expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
        usedAt: null,
        createdAt: now,
      });

      const { appWebUrl } = getEmailConfig();
      const resetUrl = `${appWebUrl.replace(/\/$/, "")}?view=reset&token=${rawToken}`;

      await this.emailService.sendPasswordResetEmail({
        to: user.getEmail(),
        resetUrl,
      });
    }

    return {
      message: "If the email exists, a reset link was sent.",
    };
  }
}
