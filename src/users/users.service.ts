import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if(existingUser) {
      throw new ConflictException('Email is already in use');
    }

    try {
      return await this.userRepository.save(createUserDto);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      console.error('Error fetching errors:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch user');
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
      console.error('Error updating user:', error);
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
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user');
    }
  }
}
