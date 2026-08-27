import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CircularsService } from './circulars.service';
import { CreateCircularDto } from './dto/create-circular.dto';
import { RequestUser } from '../common/student-access.service';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('api/v1/circulars')
export class CircularsController {
  constructor(private readonly circularsService: CircularsService) {}

  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post()
  publish(@Body() dto: CreateCircularDto, @Req() req: AuthenticatedRequest) {
    return this.circularsService.publish(dto, req.user.id);
  }

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.circularsService.listForUser(req.user);
  }

  @Roles('PARENT')
  @Post(':id/read')
  markRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.circularsService.markRead(id, req.user.id);
  }

  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.circularsService.getStats(id);
  }
}
