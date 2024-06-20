/* eslint-disable @typescript-eslint/no-unsafe-member-access -- allow it */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type JWT = string;

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  async create(@Body() registerDto: RegisterDto): Promise<void> {
    const password = registerDto.password;

    try {
      if (password && process.env.ENV_SALT) {
        registerDto.password = await argon2.hash(password.trim(), {
          raw: false,
          salt: Buffer.from(process.env.ENV_SALT),
          hashLength: 36,
        });
      }
    } catch (err) {
      console.error(err);
    }

    await this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<JWT> {
    const user = await this.authService.login(
      loginDto.email.trim().toLowerCase(),
      loginDto.password.trim(),
    );

    const token = await this.jwtService.signAsync(user, {
      secret: process.env.ENV_JWT_SECRET,
    });

    return token;
  }

  @Public()
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(@Req() _req: any) {
    //
  }

  @Public()
  @Get('login/google/callback')
  @UseGuards(AuthGuard('google'))
  async loginGoogleCallback(@Req() req: any): Promise<JWT> {
    if (!req.user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const user = await this.authService.loginGoogle(
      String(req?.user?.profile?.displayName ?? ''),
      String(req?.user?.profile?.emails?.[0]?.value ?? ''),
    );

    const token = await this.jwtService.signAsync(user, {
      secret: process.env.ENV_JWT_SECRET,
    });

    return token;
  }
}
