import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if(existingUser) {
      throw new ConflictException('Email is already in use');
    }

    try {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      createUserDto.password = hashedPassword;

      return await this.userRepository.save(createUserDto);
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'username', 'email', 'country', 'state', 'city']
      });
      return users;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<Partial<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const {password, ...userWithoutPassword} = user;
      return userWithoutPassword;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if(!user) {
        throw new NotFoundException('E-mail not found');
      }

      return user;
    } catch (error) {
      throw new Error('Failed to find email');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      Object.assign(user, updateUserDto);

      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userRepository.remove(user);
    } catch (error) {
      throw new Error('Failed to remove user');
    }
  }
}
