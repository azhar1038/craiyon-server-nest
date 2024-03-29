import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/common/services/file/file.service';
import {
  GeneratedImage,
  GeneratorModel,
  ImageResolution,
} from './entities/generated-image.entity';
import { Repository } from 'typeorm';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderBy, SortBy } from 'src/common/enums';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(GeneratedImage)
    private readonly generatedImageRepository: Repository<GeneratedImage>,
    private readonly fileService: FileService,
  ) {}

  async saveImage(
    userId: string,
    prompt: string,
    model: GeneratorModel,
    resolution: ImageResolution,
    path: string,
  ): Promise<string> {
    const image = this.generatedImageRepository.create({
      prompt,
      model: model,
      resolution: resolution,
      url: path,
      generatedBy: {
        id: userId,
      },
    });

    await this.generatedImageRepository.save(image);

    return image.id;
  }

  async resolvePath(
    userId: string | undefined,
    imageId: string,
  ): Promise<string> {
    const image = await this.generatedImageRepository.findOne({
      select: {
        url: true,
      },
      where: [
        { id: imageId, isPrivate: false },
        { id: imageId, generatedBy: { id: userId } },
      ],
    });

    if (!image) throw new NotFoundException('Image does not exists');

    return path.join('generatedImages', image.url);
  }

  async getUserGeneratedImages(
    userId: string,
    limit: number,
    page: number,
  ): Promise<GeneratedImage[]> {
    return await this.generatedImageRepository.find({
      where: {
        generatedBy: {
          id: userId,
        },
      },
      skip: page * limit,
      take: limit,
    });
  }

  // TODO: Fix this - how to get if user has favorited an image!
  async getPublicImages(
    userId: string | undefined,
    limit: number,
    page: number,
    sort: SortBy,
    order: OrderBy,
  ): Promise<GeneratedImage[]> {
    const orderBy = {};
    if (sort === SortBy.LIKE) {
      orderBy['likes'] = order;
    } else if (sort === SortBy.CREATED) {
      orderBy['generatedAt'] = order;
    }

    // const images = await this.generatedImageRepository.find({
    //   where: {
    //     isPrivate: false,
    //   },
    //   include: {
    //     Favourite: {
    //       select: {
    //         userId: true,
    //       },
    //       where: {
    //         userId: userId ?? 0,
    //       },
    //     },
    //   },
    //   skip: page * limit,
    //   take: limit,
    //   orderBy,
    // });

    return await this.generatedImageRepository.find({
      where: {
        isPrivate: false,
      },
      skip: page * limit,
      take: limit,
      order: orderBy,
    });
  }

  async isFavorite(userId: string, imageId: string): Promise<boolean> {
    const image = await this.generatedImageRepository.findOne({
      select: {
        id: true,
      },
      where: {
        id: imageId,
        isPrivate: false,
        favoritedBy: {
          id: userId,
        },
      },
    });

    return !!image;
  }

  // TODO: Fix this - Add the row in favorite!
  async addToFavorite(userId: string, imageId: string): Promise<void> {
    await this.generatedImageRepository.update(
      { id: imageId },
      {
        likes: () => 'likes + 1',
      },
    );
  }

  // TODO: Fix this - Remove row from favorite!
  async removeFromFavorite(userId: string, imageId: string): Promise<void> {
    await this.generatedImageRepository.update(
      { id: imageId },
      {
        likes: () => 'likes + 1',
      },
    );
  }

  async isPrivate(userId: string, imageId: string): Promise<boolean> {
    const image = await this.generatedImageRepository.findOne({
      select: {
        id: true,
        isPrivate: true,
      },
      where: {
        id: imageId,
        generatedBy: {
          id: userId,
        },
      },
    });

    if (!image) throw new NotFoundException('Image does not exists');

    return image.isPrivate;
  }

  async addToPrivate(imageId: string): Promise<void> {
    await this.generatedImageRepository.update(imageId, {
      isPrivate: true,
    });
  }

  async remoeFromPrivate(imageId: string): Promise<void> {
    await this.generatedImageRepository.update(imageId, {
      isPrivate: false,
    });
  }

  // TODO: Delete from favorite table
  async deleteImage(userId: string, imageId: string): Promise<void> {
    const image = await this.generatedImageRepository.findOne({
      select: {
        id: true,
        url: true,
      },
      where: {
        id: imageId,
        generatedBy: {
          id: userId,
        },
      },
    });

    if (!image) throw new NotFoundException('Image dies not exists');

    // Delete from favorite list
    // await prisma.favourite.deleteMany({
    //   where: {
    //     imageId,
    //   },
    // });

    // Delete from image table
    await this.generatedImageRepository.delete(imageId);

    // Delete file
    await this.fileService.deleteFile(image.url);
  }
}
