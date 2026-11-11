import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './current-user.decorator';
import type { User } from './interfaces/session.interface';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.login(loginDto);
    const ttlMs = Number(
      this.configService.get<string>('SESSION_TTL_MS') ?? 3600000,
    );
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // Set secure, HTTP-only cookie for browser navigation
    response.cookie('session_token', session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ttlMs,
      path: '/',
    });

    return {
      success: true,
      message: 'Login successful',
      user,
      token: session.token,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.sessionToken) {
      this.authService.logout(request.sessionToken);
    }

    // Clear browser session cookie
    response.clearCookie('session_token', {
      path: '/',
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: User) {
    return {
      success: true,
      user,
    };
  }
}
