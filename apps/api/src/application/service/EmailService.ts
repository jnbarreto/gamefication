export type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

export default interface EmailService {
  sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void>;
}
