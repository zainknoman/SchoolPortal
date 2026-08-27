import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MeService } from './me.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: string };
}

@Controller('api/v1/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  me(@Req() req: AuthenticatedRequest) {
    return { id: req.user.id, role: req.user.role };
  }

  @Get('children')
  children(@Req() req: AuthenticatedRequest) {
    return this.meService.getChildrenForUser(req.user.id);
  }
}
