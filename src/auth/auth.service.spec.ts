/* eslint-disable @typescript-eslint/unbound-method -- allow it */
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { type Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { type RegisterDto } from './dto/register.dto';

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  describe('register', () => {
    it('should call authRepository.query with the correct parameters', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };

      await authService.register(registerDto);

      expect(authRepository.query).toHaveBeenCalledWith(
        `INSERT INTO "user" 
        (name, email, password) 
      VALUES 
        ($1, $2, $3)`,
        [registerDto.name, registerDto.email, registerDto.password],
      );
    });
  });

  describe('login', () => {
    it('should return a user if credentials are correct', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        uid: '1',
        name: 'Test User',
        email,
        password: 'hashedPassword',
        is_verified: true,
      } as User;

      authRepository.query.mockResolvedValue([{ ...user }]);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(email, password);

      expect(authRepository.query).toHaveBeenCalledWith(
        `SELECT 
          uid,
          name,
          email,
          password,
          created_at,
          updated_at,
          deleted_at,
          is_verified
        FROM "user"
        WHERE email = $1`,
        [email.trim().toLowerCase()],
      );
      expect(argon2.verify).toHaveBeenCalledWith(user.password, password);
      expect(result).toEqual({
        uid: '1',
        name: 'Test User',
        email,
        created_at: undefined,
        updated_at: undefined,
        deleted_at: undefined,
      });
    });

    it('should throw an exception if the user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      authRepository.query.mockResolvedValue([]);

      await expect(authService.login(email, password)).rejects.toThrow(
        new HttpException(`${email} isn't registered`, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an exception if the user is not verified', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        uid: '1',
        name: 'Test User',
        email,
        password: 'hashedPassword',
        is_verified: false,
      } as User;

      authRepository.query.mockResolvedValue([user]);

      await expect(authService.login(email, password)).rejects.toThrow(
        new HttpException(`${email} isn't verified`, HttpStatus.FORBIDDEN),
      );
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const user = {
        uid: '1',
        name: 'Test User',
        email,
        password: 'hashedPassword',
        is_verified: true,
      } as User;

      authRepository.query.mockResolvedValue([user]);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        new UnauthorizedException(),
      );
    });

    it('should throw an InternalServerErrorException for other errors', async () => {
      const email = 'test@example.com';
      const password = 'password';

      authRepository.query.mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.login(email, password)).rejects.toThrow(
        new HttpException(
          'Something is wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('loginGoogle', () => {
    it('should return an existing user if they already exist', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const user = {
        uid: '1',
        name,
        email,
      } as User;

      authRepository.query.mockResolvedValue([user]);

      const result = await authService.loginGoogle({ name, email });

      expect(authRepository.query).toHaveBeenCalledWith(
        `SELECT
        uid,
        name,
        email,
        created_at,
        updated_at,
        deleted_at
      FROM "user"
      WHERE email = $1`,
        [email],
      );
      expect(result).toEqual(user);
    });

    it('should create and return a new user if they do not exist', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const user = {
        uid: '1',
        name,
        email,
      } as User;

      authRepository.query
        .mockResolvedValueOnce([]) // User does not exist
        .mockResolvedValueOnce([user]); // User after insert

      const result = await authService.loginGoogle({ name, email });

      expect(authRepository.query).toHaveBeenCalledWith(
        `SELECT
        uid,
        name,
        email,
        created_at,
        updated_at,
        deleted_at
      FROM "user"
      WHERE email = $1`,
        [email],
      );
      expect(authRepository.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(user);
    });
  });
});
