type IntegrityErrorMessages =
  // Client
  | "Public key(s) already registered"
  | "User client already exists"
  // File
  | "Directory not found"
  | "File not found"
  | "Invalid DEK version"
  // MEK
  | "MEK already registered"
  | "Inactive MEK version"
  // Token
  | "Refresh token not found"
  | "Refresh token already registered";

export class IntegrityError extends Error {
  constructor(public message: IntegrityErrorMessages) {
    super(message);
    this.name = "IntegrityError";
  }
}
