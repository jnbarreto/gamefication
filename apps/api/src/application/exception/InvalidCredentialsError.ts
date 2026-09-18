import ApplicationError from "./ApplicationError.js";

export default class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("Invalid credentials");
  }
}
