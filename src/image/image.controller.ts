import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('image')
export class ImageController {
  @Get('public')
  getPublicImages() {
    return [];
  }

  @Post('generate')
  generateImage() {
    return [];
  }

  @Patch('favorite/add')
  addToFavorite() {
    return [];
  }

  @Patch('favorite/remove')
  removeFromFavorite() {
    return [];
  }

  @Patch('private/add')
  addToPrivate() {
    return [];
  }

  @Patch('private/remove')
  removeFromPrivate() {
    return [];
  }

  @Get(':id')
  getImage() {
    return [];
  }

  @Delete(':id')
  deleteImage() {
    return [];
  }
}
