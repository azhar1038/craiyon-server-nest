import { Module } from '@nestjs/common';
import { MailService } from './services/mail/mail.service';
import { FileService } from './services/file/file.service';

@Module({
  providers: [MailService, FileService],
  exports: [MailService, FileService],
})
export class CommonModule {}
