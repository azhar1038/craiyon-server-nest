import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { access, mkdir, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileService {
  private async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    let dirExists = false;
    try {
      await access(dirPath);
      dirExists = true;
    } catch (_) {}

    if (dirExists) return;

    await mkdir(dirPath, { recursive: true });
  }

  async createImageFromBase64(data: string, fileType = 'jpg'): Promise<string> {
    const dataBuffer = Buffer.from(data, 'base64');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const folderName = `${year}${month}${day}`;

    const imgDir = `generatedimages/${folderName}`;
    const fileName = `${randomBytes(16).toString('hex')}.${fileType}`;

    try {
      await this.createDirectoryIfNotExists(imgDir);
      await writeFile(join(imgDir, fileName), dataBuffer);
    } catch (err) {
      throw new InternalServerErrorException('Failed to save image');
    }

    return `${folderName}/${fileName}`;
  }

  async deleteFile(path: string): Promise<void> {
    const fullPath = `generatedimages/${path}`;
    const fileExists = await stat(fullPath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      await unlink(fullPath);
    }
  }
}
