import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { FilesService } from './files.service';
import { FilesAccessService } from './files-access.service';
import { RequestUser } from '../common/student-access.service';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('api/v1/files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly filesAccess: FilesAccessService,
  ) {}

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.upload(file);
  }

  @Get(':id')
  async download(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    await this.filesAccess.assertCanAccessFile(req.user, id);
    const { buffer, originalName, mimeType } = await this.filesService.read(id);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${originalName}"`,
    });
    res.send(buffer);
  }
}
