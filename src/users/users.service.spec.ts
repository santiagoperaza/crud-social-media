import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const USERS = [
  {
    id: 1,
    email: 'test@test.com',
    firstName: 'test2',
    lastName: 'user',
    createdAt: '2023-11-25T21:21:40.167Z',
    updatedAt: '2023-11-25T21:21:40.167Z',
  },
  {
    id: 2,
    email: 'test@test.com',
    firstName: 'test3',
    lastName: 'user',
    createdAt: '2023-11-25T21:21:44.665Z',
    updatedAt: '2023-11-25T21:21:44.665Z',
  },
  {
    id: 3,
    email: 'test@test.com',
    firstName: 'test3',
    lastName: 'user',
    createdAt: '2023-11-25T21:21:46.973Z',
    updatedAt: '2023-11-25T21:21:46.973Z',
  },
];

const USER = {
  id: 3,
  email: 'test@test.com',
  firstName: 'test3',
  lastName: 'user',
  createdAt: new Date('2023-11-25T21:21:46.973Z'),
  updatedAt: new Date('2023-11-25T21:21:46.973Z'),
};

const MOCK_UPDATED_USER = {
  id: 3,
  email: 'test@test.com',
  firstName: 'updatedFirstName',
  lastName: 'updatedLastName',
  createdAt: new Date('2023-11-25T21:21:46.973Z'),
  updatedAt: new Date('2023-11-25T21:21:46.973Z'),
};

const VALID_USER_ID = 3;
const NOT_FOUND_USER_ID = 999;
const FIND_AND_COUNT = [USERS, 10];

const VALID_CREATE_USER_DTO = {
  email: USER.email,
  firstName: USER.firstName,
  lastName: USER.lastName,
  password: '123456',
};

const VALID_UPDATE_USER_DTO = {
  firstName: MOCK_UPDATED_USER.firstName,
  lastName: MOCK_UPDATED_USER.lastName,
  password: 'updatedPassword',
};

const EXPECTED_FIND_ALL = {
  data: USERS,
  total: 10,
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue({}),
            findAndCount: jest.fn().mockResolvedValue(FIND_AND_COUNT),
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue(USER),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return all users with default paginated values', async () => {
      const findAndCountSpy = jest.spyOn(repository, 'findAndCount');
      const expectedFindAndCountParams = {
        order: { id: 'ASC' },
        take: DEFAULT_PAGE_SIZE,
        skip: (DEFAULT_PAGE - 1) * DEFAULT_PAGE_SIZE,
      };
      const users = await service.findAll();

      expect(users).toEqual(EXPECTED_FIND_ALL);
      expect(findAndCountSpy).toHaveBeenCalledTimes(1);
      expect(findAndCountSpy).toHaveBeenCalledWith(expectedFindAndCountParams);
    });

    it('should call findAndCount with provided paginated values', async () => {
      const findAndCountSpy = jest.spyOn(repository, 'findAndCount');
      const page = 2;
      const pageSize = 10;
      const expectedFindAndCountParams = {
        order: { id: 'ASC' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      };
      const users = await service.findAll({ page, pageSize });

      expect(users).toEqual(EXPECTED_FIND_ALL);
      expect(findAndCountSpy).toHaveBeenCalledTimes(1);
      expect(findAndCountSpy).toHaveBeenCalledWith(expectedFindAndCountParams);
    });
  });

  describe('findOne', () => {
    it('should return the user data if exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(USER);
      await expect(service.findOne(VALID_USER_ID)).resolves.toEqual(USER);
    });

    it('should throw NotFoundException if user does not exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne(NOT_FOUND_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should successfully save a new user', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      const user = await service.create(VALID_CREATE_USER_DTO);
      expect(user).toEqual(USER);
      expect(repository.save).toHaveBeenCalledWith(VALID_CREATE_USER_DTO);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if email already registered', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(USER);
      await expect(service.create(VALID_CREATE_USER_DTO)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).toHaveBeenCalledTimes(0);
    });
  });

  describe('update', () => {
    it('should successfully update the user if exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(MOCK_UPDATED_USER);
      const user = await service.update(VALID_USER_ID, VALID_UPDATE_USER_DTO);
      expect(user).toEqual(MOCK_UPDATED_USER);
      expect(repository.update).toHaveBeenCalledWith(
        VALID_USER_ID,
        VALID_UPDATE_USER_DTO,
      );
      expect(repository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.update(NOT_FOUND_USER_ID, VALID_UPDATE_USER_DTO),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove the user if exists', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');
      await expect(service.remove(VALID_USER_ID)).resolves.not.toThrow();
      expect(deleteSpy).toHaveBeenCalledWith({ id: VALID_USER_ID });
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      await expect(service.remove(NOT_FOUND_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
