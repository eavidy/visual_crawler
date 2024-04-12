export class AuthorizationError extends Error {
  constructor(msg: string, type: "unauthorize");
  constructor(msg: string, type: "authorizationExpired");
  constructor(msg: string, type: string);
  constructor(
    msg: string,
    readonly type: string,
  ) {
    super(msg);
  }
}
