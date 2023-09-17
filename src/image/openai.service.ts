import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import { FileService } from 'src/common/services/file/file.service';
import configuration from 'src/config/configuration';
import { ImageResolution } from './entities/generated-image.entity';

@Injectable()
export class OpenaiService {
  private openAi: OpenAI;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly fileService: FileService,
  ) {
    this.openAi = new OpenAI({
      apiKey: config.token.openAi,
    });
  }

  async generateImage(
    prompt: string,
    resolution: ImageResolution,
  ): Promise<string> {
    const apiResponse = await this.openAi.images.generate({
      prompt,
      n: 1,
      size: resolution,
      response_format: 'b64_json',
    });

    const data: string = apiResponse.data[0].b64_json as string;
    const filePath = await this.fileService.createImageFromBase64(data);
    return filePath;
  }
}
