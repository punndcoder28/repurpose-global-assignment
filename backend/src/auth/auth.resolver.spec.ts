import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAuthResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user with valid input', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(registerInput);

      expect(authService.register).toHaveBeenCalledWith(
        registerInput.email,
        registerInput.password,
      );
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return correct response format with token and user', async () => {
      const registerInput: RegisterInput = {
        email: 'newuser@example.com',
        password: 'securepass123',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(registerInput);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('createdAt');
      expect(result.user).toHaveProperty('updatedAt');
      expect(typeof result.token).toBe('string');
      expect(typeof result.user.id).toBe('number');
      expect(typeof result.user.email).toBe('string');
    });

    it('should throw ConflictException when email already exists', async () => {
      const registerInput: RegisterInput = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(resolver.register(registerInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(resolver.register(registerInput)).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should handle email with different cases', async () => {
      const registerInput: RegisterInput = {
        email: 'Test@Example.COM',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue({
        ...mockAuthResponse,
        user: { ...mockUser, email: 'Test@Example.COM' },
      });

      const result = await resolver.register(registerInput);

      expect(authService.register).toHaveBeenCalledWith(
        'Test@Example.COM',
        'password123',
      );
      expect(result.user.email).toBe('Test@Example.COM');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password,
      );
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return correct response format with token and user', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(loginInput);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('createdAt');
      expect(result.user).toHaveProperty('updatedAt');
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const loginInput: LoginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(resolver.login(loginInput)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle login with email in different cases', async () => {
      const loginInput: LoginInput = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(
        'TEST@EXAMPLE.COM',
        'password123',
      );
      expect(result).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      for (const email of validEmails) {
        const input: RegisterInput = { email, password: 'password123' };
        await resolver.register(input);
        expect(authService.register).toHaveBeenCalledWith(email, 'password123');
      }
    });

    it('should pass through password without modification', async () => {
      const passwords = [
        'simple',
        'Complex123!',
        'very-long-password-with-special-chars-!@#$%',
        '12345678',
      ];

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      for (const password of passwords) {
        const input: RegisterInput = {
          email: 'test@example.com',
          password,
        };
        await resolver.register(input);
        expect(authService.register).toHaveBeenCalledWith(
          'test@example.com',
          password,
        );
      }
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors correctly', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const customError = new Error('Database connection failed');
      mockAuthService.login.mockRejectedValue(customError);

      await expect(resolver.login(loginInput)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle service returning null or undefined', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(null);

      const result = await resolver.login(loginInput);
      expect(result).toBeNull();
    });
  });
});
