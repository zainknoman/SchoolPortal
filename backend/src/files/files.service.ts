import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../storage/storage-adapter';
import type { StorageAdapter } from '../storage/storage-adapter';

export interface FileMeta {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter,
  ) {}

  async upload(file: Express.Multer.File): Promise<FileMeta> {
    const storageKey = await this.storage.save(file.buffer, extname(file.originalname));
    const record = await this.prisma.file.create({
      data: {
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
    return {
      id: record.id,
      originalName: record.originalName,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
    };
  }

  async read(fileId: string): Promise<{ buffer: Buffer; originalName: string; mimeType: string }> {
    const record = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!record) {
      throw new NotFoundException('File not found');
    }
    const buffer = await this.storage.read(record.storageKey);
    return { buffer, originalName: record.originalName, mimeType: record.mimeType };
  }
}
