import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { User } from './interfaces/session.interface';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // 1. Check Bearer token in Authorization header
    let token: string | undefined;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Fallback to HTTP-only cookie if header is not present
    if (!token && request.cookies) {
      token = request.cookies['session_token'];
    }

    if (!token) {
      return this.handleUnauthorized(request, response);
    }

    // 3. Validate against in-memory session store
    const session = this.sessionService.getSession(token);
    if (!session) {
      return this.handleUnauthorized(request, response);
    }

    // Attach user and token to request object for downstream usage
    request.user = session.user;
    request.sessionToken = token;

    return true;
  }

  private handleUnauthorized(request: Request, response: Response): boolean {
    const isApiRequest =
      request.path.startsWith('/api/') ||
      request.headers.accept?.includes('application/json');

    if (isApiRequest) {
      throw new UnauthorizedException('Authentication missing, invalid, or expired');
    }

    // For browser page navigation, redirect to login page
    response.redirect('/login');
    return false;
  }
}
