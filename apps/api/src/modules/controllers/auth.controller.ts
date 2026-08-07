import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('google/url')
  getGoogleOAuthUrl() {
    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/business.manage',
    ];
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:4000/auth/google/callback',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes.join(' '),
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      scopes,
      next: 'Exchange callback code, encrypt refresh token, and connect GBP accounts.',
    };
  }
}
