declare module "express-session" {
  export interface SessionData {
    verifiedEmail?: string | undefined;
  }
}

export {};
