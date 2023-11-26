import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUserData, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exists = await this.exists(createUserDto.email);
    if (exists)
      throw new BadRequestException(
        `Email ${createUserDto.email} already registered`,
      );
    return this.usersRepository.save(createUserDto);
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.getUserIfExists(id);
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
