/* eslint-disable @typescript-eslint/no-unsafe-assignment -- allow it*/
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.ENV_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.ENV_GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: 'http://localhost:3000/auth/login/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    done(null, {
      profile,
      accessToken,
      refreshToken,
    });
  }
}
