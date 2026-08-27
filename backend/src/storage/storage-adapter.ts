export interface StorageAdapter {
  save(buffer: Buffer, extension: string): Promise<string>;
  read(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}

export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';
