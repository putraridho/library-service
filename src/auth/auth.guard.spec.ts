/* eslint-disable @typescript-eslint/no-unsafe-return -- allow it */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- allow it */
/* eslint-disable @typescript-eslint/unbound-method -- allow it */
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Request } from 'express';
import { type User } from '../user/user.entity';
import { AuthGuard } from './auth.guard';

// Mock JwtService
const mockJwtService = {
  verifyAsync: jest.fn().mockImplementation(() => Promise.resolve({} as User)),
};

// Mock Reflector
const mockReflector = {
  getAllAndOverride: jest.fn().mockReturnValue(false), // Mocking IS_PUBLIC_KEY
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no token is provided', async () => {
      const context = createContext();

      // Mock extractTokenFromHeader to return undefined (no token)
      mockExtractTokenFromHeader(
        context.switchToHttp().getRequest,
      ).mockReturnValue(undefined);

      // Assert that canActivate throws UnauthorizedException
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Add other test cases for different scenarios as per your requirements
  });
});

// Helper function to create ExecutionContext with mocked getRequest
function createContext(): ExecutionContext {
  const request = { headers: { authorization: undefined } };
  const httpContext = {
    getRequest: jest.fn().mockReturnValue(request),
    switchToHttp: () => httpContext,
  } as any;

  return {
    switchToHttp: () => httpContext,
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

// Mocking extractTokenFromHeader function
function mockExtractTokenFromHeader(getRequest: () => Request): jest.Mock {
  return jest.fn().mockImplementation(() => {
    const [type, token] = getRequest().headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  });
}
