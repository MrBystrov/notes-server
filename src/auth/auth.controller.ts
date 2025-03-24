import { Controller, Post, Body, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { User } from 'src/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() data: { useremail: string; password: string },
    @Res() response: Response,
  ) {
    const { token, user } = await this.authService.findUserByEmail(
      data.useremail,
      data.password,
    );

    response.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none', // Разрешить кросс-доменные запросы
      secure: true,
    });

    return response.status(200).json({ user });
  }

  @Post('register')
  async register(
    @Body() data: { username: string; useremail: string; password: string },
  ) {
    const newuser: User | null = await this.authService.createUser(
      data.username,
      data.useremail,
      data.password,
    );
    return newuser;
  }
}
