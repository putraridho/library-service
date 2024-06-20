/* eslint-disable @typescript-eslint/unbound-method -- allow it */
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { type LoginDto } from './dto/login.dto';
import { type RegisterDto } from './dto/register.dto';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            loginGoogle: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwtToken'),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with hashed password', async () => {
      const registerDto: RegisterDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
      };
      process.env.ENV_SALT = 'salt';

      await authController.create(registerDto);

      expect(argon2.hash).toHaveBeenCalledWith('password', {
        raw: false,
        salt: Buffer.from('salt'),
        hashLength: 36,
      });
      expect(authService.register).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      authService.login = jest.fn().mockResolvedValue({ id: 1 });

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id: 1 },
        { secret: process.env.ENV_JWT_SECRET },
      );
      expect(result).toBe('jwtToken');
    });
  });

  describe('loginGoogle', () => {
    it('should be defined', () => {
      expect(authController.loginGoogle).toBeDefined();
    });
  });

  describe('loginGoogleCallback', () => {
    it('should return a JWT token', async () => {
      const req = {
        user: {
          profile: {
            displayName: 'John Doe',
            emails: [{ value: 'john.doe@example.com' }],
          },
        },
      };
      authService.loginGoogle = jest.fn().mockResolvedValue({ id: 1 });

      const result = await authController.loginGoogleCallback(req);

      expect(authService.loginGoogle).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id: 1 },
        { secret: process.env.ENV_JWT_SECRET },
      );
      expect(result).toBe('jwtToken');
    });

    it('should throw an HttpException if req.user is not defined', async () => {
      const req = {};

      await expect(authController.loginGoogleCallback(req)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
