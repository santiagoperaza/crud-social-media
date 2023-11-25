import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  async findAll({ page = 1, pageSize = 20 }): Promise<any> {
    const [result, total] = await this.usersRepository.findAndCount({
      order: { id: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return {
      data: result,
      count: total,
    };
  }

  async findOne(id: number) {
    return this.checkUserExists(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.checkUserExists(id);
    await this.usersRepository.update(id, updateUserDto);
    return this.checkUserExists(id);
  }

  async remove(id: number) {
    await this.checkUserExists(id);
    return this.usersRepository.delete({ id });
  }

  /**
   * @param id of the user
   * @returns the user if exists or NotFoundException if does not exist
   */
  private async checkUserExists(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }
}
