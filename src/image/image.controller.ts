import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserIdInterceptor } from 'src/common/interceptors/user-id.interceptor';
import { PublicImageDto } from './dto/public-image.dto';
import { ImageService } from './image.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GenerateImageDto } from './dto/generate-image.dto';
import { GeneratorModel } from './entities/generated-image.entity';
import { OpenaiService } from './openai.service';
import { ImageDto } from './dto/image.dto';
import { createReadStream } from 'fs';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly openaiService: OpenaiService,
    private readonly userService: UserService,
  ) {}

  @Get('public')
  @UseInterceptors(UserIdInterceptor)
  async getPublicImages(
    @Req() req: Request,
    @Body() publicImageDto: PublicImageDto,
  ) {
    const userId: string | undefined = req['userId'];

    return await this.imageService.getPublicImages(
      userId,
      publicImageDto.limit,
      publicImageDto.page,
      publicImageDto.sort,
      publicImageDto.order,
    );
  }

  @Post('generate')
  @UseGuards(AuthGuard)
  async generateImage(
    @Req() req: Request,
    @Body() generateImageDto: GenerateImageDto,
  ) {
    const userId: string = req['userId'];

    let filePath = '';
    if (generateImageDto.model === GeneratorModel.DALLE) {
      filePath = await this.openaiService.generateImage(
        generateImageDto.prompt,
        generateImageDto.resolution,
      );
    }

    if (!filePath)
      throw new InternalServerErrorException('Failed to save image');

    const imageId = await this.imageService.saveImage(
      userId,
      generateImageDto.prompt,
      generateImageDto.model,
      generateImageDto.resolution,
      filePath,
    );

    return {
      imageId,
    };
  }

  @Patch('favorite/add')
  @UseGuards(AuthGuard)
  async addToFavorite(@Req() req: Request, @Body() imageDto: ImageDto) {
    const userId: string = req['userId'];
    const isFavorite = this.imageService.isFavorite(userId, imageDto.imageId);
    if (isFavorite)
      throw new BadRequestException('Image already added to favorite');

    await this.imageService.addToFavorite(userId, imageDto.imageId);
    return {
      message: 'Added to favorite',
    };
  }

  @Patch('favorite/remove')
  @UseGuards(AuthGuard)
  async removeFromFavorite(@Req() req: Request, @Body() imageDto: ImageDto) {
    const userId: string = req['userId'];
    const isFavorite = this.imageService.isFavorite(userId, imageDto.imageId);
    if (!isFavorite) throw new BadRequestException('Image not in favorite');

    await this.imageService.removeFromFavorite(userId, imageDto.imageId);
    return {
      message: 'Removed from favorite',
    };
  }

  @Patch('private/add')
  @UseGuards(AuthGuard)
  async addToPrivate(@Req() req: Request, @Body() imageDto: ImageDto) {
    const userId: string = req['userId'];
    const isPrivate = this.imageService.isPrivate(userId, imageDto.imageId);
    if (isPrivate) throw new BadRequestException('Image is already private');

    await this.imageService.addToPrivate(imageDto.imageId);
    return {
      message: 'Image is now private',
    };
  }

  @Patch('private/add')
  @UseGuards(AuthGuard)
  async removeFromPrivate(@Req() req: Request, @Body() imageDto: ImageDto) {
    const userId: string = req['userId'];
    const isPrivate = this.imageService.isPrivate(userId, imageDto.imageId);
    if (!isPrivate) throw new BadRequestException('Image is already public');

    await this.imageService.remoeFromPrivate(imageDto.imageId);
    return {
      message: 'Image is now public',
    };
  }

  @Get(':id')
  @UseInterceptors(UserIdInterceptor)
  async getImage(@Req() req: Request, @Param('id') imageId: string) {
    const userId: string | undefined = req['userId'];

    const imagePath = await this.imageService.resolvePath(userId, imageId);
    const file = createReadStream(imagePath);

    return new StreamableFile(file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteImage(@Req() req: Request, @Param('id') imageId: string) {
    const userId: string = req['userId'];
    const user = await this.userService.getUserFromId(userId);
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MEMBER) {
      throw new ForbiddenException('No permission to delete this image');
    }

    await this.imageService.deleteImage(userId, imageId);
    return {
      message: 'Image has been deleted',
    };
  }
}
