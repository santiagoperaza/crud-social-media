import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const USER_EMAIL = 'email@test.com';
const USER_PASSWORD = '12345678';
const SIGN_IN_USER_DTO = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
};
const MOCKED_USER_DATA = {
  id: 100,
  email: USER_EMAIL,
  password: USER_PASSWORD,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneBy: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue(true),
            verifyAsync: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('signIn', () => {
    it('should return valid access token if email and password match', async () => {
      const bcryptMock = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptMock;
      jest
        .spyOn(usersService, 'findOneBy')
        .mockResolvedValue(MOCKED_USER_DATA as any);
      await expect(service.signIn(SIGN_IN_USER_DTO)).resolves.not.toThrow();
    });

    it('should throw BadRequestException if email is not registered', async () => {
      jest.spyOn(usersService, 'findOneBy').mockImplementation(() => {
        throw new BadRequestException(`Email ${USER_EMAIL} not registered`);
      });
      await expect(service.signIn(SIGN_IN_USER_DTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const bcryptMock = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptMock;
      jest
        .spyOn(usersService, 'findOneBy')
        .mockResolvedValue(MOCKED_USER_DATA as any);
      await expect(service.signIn(SIGN_IN_USER_DTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
