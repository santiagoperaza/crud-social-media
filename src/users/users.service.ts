import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUserData, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as usersData from './../data/users.json';
import * as bcrypt from 'bcrypt';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      await Promise.all(usersData.map((user) => this.create(user)));
      console.log(
        `Successfully loaded ${usersData.length} users in the database`,
      );
    } catch (error) {
      console.error(
        `Failed loading user data from file. Error: ${error.message}`,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.exists(createUserDto.email);
    if (exists)
      throw new BadRequestException(
        `Email ${createUserDto.email} already registered`,
      );

    // Hash password for security
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      }),
    );
    // Exclude password from return
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  async findAll({
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
  }: { page?: number; pageSize?: number } = {}): Promise<PaginatedUserData> {
    const [result, total] = await this.usersRepository.findAndCount({
      order: { id: 'ASC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return {
      data: result,
      total,
    };
  }

  findOne(id: number): Promise<User> {
    return this.getUserIfExists(id);
  }

  /**
   * By default, password is not retrieved from DB for security.
   * This method is used for login, hence we need to retrieve password value.
   * @param email
   */
  findOneBy(email: string): Promise<User> {
    return this.usersRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.getUserIfExists(id);
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto = { ...updateUserDto, password: hashedPassword };
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.getUserIfExists(id);
  }

  async remove(id: number): Promise<void> {
    await this.getUserIfExists(id);
    await this.usersRepository.delete({ id });
  }

  /**
   * @param id of the user
   * @returns the user if exists or NotFoundException if does not exist
   */
  private async getUserIfExists(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }

  /**
   * @param email of the user
   * @returns true if exists, false otherwise
   */
  private async exists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ email });
    return user != null;
  }
}
