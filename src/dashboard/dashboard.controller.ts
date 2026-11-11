import { Controller, Get, Render, Res, Req, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { SessionService } from '../auth/session.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../auth/interfaces/session.interface';

@Controller()
export class DashboardController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  root(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const token = req.cookies?.['session_token'];
    if (token && this.sessionService.getSession(token)) {
      return res.redirect('/dashboard');
    }
    return res.redirect('/login');
  }

  @Get('login')
  loginPage(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const token = req.cookies?.['session_token'];
    if (token && this.sessionService.getSession(token)) {
      return res.redirect('/dashboard');
    }
    return res.render('login', { title: 'Sign In - NestJS Dashboard' });
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  @Render('dashboard')
  dashboardPage(@CurrentUser() user: User) {
    const activeSessions = this.sessionService.getActiveSessionCount();

    // Extended static sample data
    const staticData = {
      totalUsers: 3_847,
      activeSessions,
      totalTasks: 214,
      completedTasks: 189,
      pendingTasks: 25,
      uptimePercent: 99.98,

      // Metric cards with richer context
      metrics: [
        { label: 'Total Users',     value: '3,847', trend: '+18%',  trendUp: true,  note: 'vs last month' },
        { label: 'Active Sessions', value: activeSessions, live: true },
        { label: 'Total Tasks',     value: '214',   trend: '+7%',   trendUp: true,  note: '189 completed' },
      ],

      // Extended static sample data
      activities: [
        { id:  1, action: 'User Sign In',              user: user?.name ?? 'Admin', time: 'Just now',      status: 'Success',   statusClass: 'success'  },
        { id:  2, action: 'Password Reset Requested',  user: 'jane.doe@corp.com',   time: '4 mins ago',    status: 'Pending',   statusClass: 'warning'  },
        { id:  3, action: 'Database Backup Sync',      user: 'System',              time: '15 mins ago',   status: 'Completed', statusClass: 'success'  },
        { id:  4, action: 'New API Key Generated',     user: 'dev-bot',             time: '32 mins ago',   status: 'Success',   statusClass: 'success'  },
        { id:  5, action: 'Security Policy Audit',     user: 'SecOps',              time: '1 hour ago',    status: 'Verified',  statusClass: 'info'     },
        { id:  6, action: 'Failed Login Attempt',      user: 'unknown@example.net', time: '1 hour ago',    status: 'Blocked',   statusClass: 'danger'   },
        { id:  7, action: 'API Health Check',          user: 'Monitor',             time: '2 hours ago',   status: 'Passed',    statusClass: 'success'  },
        { id:  8, action: 'User Role Updated',         user: 'admin@corp.com',      time: '3 hours ago',   status: 'Success',   statusClass: 'success'  },
        { id:  9, action: 'Cache Cleared',             user: 'System',              time: '5 hours ago',   status: 'Completed', statusClass: 'success'  },
        { id: 10, action: 'SSL Certificate Renewed',   user: 'infra-bot',           time: '8 hours ago',   status: 'Success',   statusClass: 'success'  },
      ],
    };

    return {
      title: 'Dashboard Overview',
      user,
      ...staticData,
    };
  }
}
