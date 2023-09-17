import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  register() {
    return '';
  }

  @Post()
  login() {
    return '';
  }

  @Post()
  refreshToken() {
    return '';
  }
}
