import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';
import { User, SessionRecord } from './interfaces/session.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Validates credentials against predefined server-side environment variables.
   * On success, creates and returns an in-memory session.
   */
  async login(loginDto: LoginDto): Promise<{ user: User; session: SessionRecord }> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@example.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') ?? 'Admin@123';
    const adminName = this.configService.get<string>('ADMIN_NAME') ?? 'Admin';
    const adminId = Number(this.configService.get<string>('ADMIN_ID') ?? 1);
    const ttlMs = Number(this.configService.get<string>('SESSION_TTL_MS') ?? 3600000);

    // Verify credentials
    if (loginDto.email !== adminEmail || loginDto.password !== adminPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user: User = {
      id: adminId,
      name: adminName,
      email: adminEmail,
    };

    const session = this.sessionService.createSession(user, ttlMs);
    return { user, session };
  }

  /**
   * Invalidates the session.
   */
  logout(token: string): boolean {
    return this.sessionService.deleteSession(token);
  }

  /**
   * Validates token and returns user details.
   */
  validateSession(token: string): User | null {
    const session = this.sessionService.getSession(token);
    return session ? session.user : null;
  }
}
