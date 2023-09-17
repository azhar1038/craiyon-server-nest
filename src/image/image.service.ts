import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/common/services/file/file.service';
import {
  GeneratedImage,
  GeneratorModel,
  ImageResolution,
} from './entities/generated-image.entity';
import { EntityManager, Repository } from 'typeorm';
import path from 'path';
import { globalPaths } from 'src/config/globals.constants';

@Injectable()
export class ImageService {
  constructor(
    private readonly fileService: FileService,
    @Inject(GeneratedImage)
    private readonly generatedImageRepository: Repository<GeneratedImage>,
    private readonly entityManager: EntityManager,
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

    return path.join(globalPaths.GENERATED_IMAGES, image.url);
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
    sort: string,
    order: string,
  ): Promise<GeneratedImage[]> {
    const orderBy = {};
    if (sort === 'like') {
      orderBy['likes'] = order;
    } else if (sort === 'created') {
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

  async toggleImagePrivate(userId: string, imageId: string): Promise<string> {
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

    if (!image) throw new NotFoundException('Image dies not exists');

    await this.generatedImageRepository.update(imageId, {
      isPrivate: !image.isPrivate,
    });

    return `Image is now ${image.isPrivate ? 'Public' : 'Private'}`;
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
