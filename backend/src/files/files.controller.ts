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
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: AuthenticatedRequest) {
    return this.filesService.upload(file, req.user.id);
  }

  @Get(':id')
  async download(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    await this.filesAccess.assertCanAccessFile(req.user, id);
    const { buffer, originalName, mimeType } = await this.filesService.read(id);
    // Serve as a forced download (not inline) so an attacker-controlled mimetype/filename
    // (e.g. a .html file declared as text/html) can never render as a page on this origin —
    // which matters here because download links carry the caller's JWT via ?access_token=.
    // Strip quotes from the filename to prevent header injection via Content-Disposition.
    const safeName = originalName.replace(/"/g, '');
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(buffer);
  }
}
