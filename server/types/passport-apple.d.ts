declare module 'passport-apple' {
  import { Request } from 'express';
  import { Strategy as PassportStrategy } from 'passport';

  export interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    callbackURL: string;
    keyID: string;
    privateKeyLocation: string;
    passReqToCallback?: boolean;
  }

  export interface AppleProfile {
    id: string;
    name: {
      firstName: string;
      lastName: string;
    };
    emails: { value: string; verified: boolean }[];
    photos?: { value: string }[];
    _json: any;
  }

  export type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    profile: AppleProfile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export type VerifyCallbackWithRequest = (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: AppleProfile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(
      options: AppleStrategyOptions,
      verify: VerifyCallback | VerifyCallbackWithRequest
    );
    name: string;
    authenticate(req: Request, options?: any): void;
  }
}