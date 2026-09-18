export default abstract class AppError extends Error {
  readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    this.code = this.buildCode();
  }

  private buildCode(): string {
    const baseName = this.constructor.name.replace(/Error$/, "");
    const snakeCase = baseName.replace(/([a-z0-9])([A-Z])/g, "$1_$2");

    return `${snakeCase.toUpperCase()}_ERROR`;
  }
}
