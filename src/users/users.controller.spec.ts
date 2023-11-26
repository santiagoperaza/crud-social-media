import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaginatedUserData } from './entities/user.entity';

const USERS: PaginatedUserData = {
  data: [
    {
      id: 1,
      email: 'test@test.com',
      firstName: 'test2',
      lastName: 'user',
      createdAt: new Date('2023-11-25T21:21:40.167Z'),
      updatedAt: new Date('2023-11-25T21:21:40.167Z'),
    },
    {
      id: 2,
      email: 'test@test.com',
      firstName: 'test3',
      lastName: 'user',
      createdAt: new Date('2023-11-25T21:21:44.665Z'),
      updatedAt: new Date('2023-11-25T21:21:58.676Z'),
    },
    {
      id: 3,
      email: 'test@test.com',
      firstName: 'test3',
      lastName: 'user',
      createdAt: new Date('2023-11-25T21:21:46.973Z'),
      updatedAt: new Date('2023-11-25T21:21:48.158Z'),
    },
  ],
  total: 39,
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(USERS),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(USERS);

      expect(await controller.findAll()).toBe(USERS);
    });
  });
});
