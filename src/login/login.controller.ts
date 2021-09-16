import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import { MongoRepository } from 'typeorm';
import LoginDto from './dto/login.dto';

@Controller('login')
export default class LoginController {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
  ) {}

  @Post()
  async login(@Body() loginDto: LoginDto): Promise<User> {
    if (!loginDto || !loginDto.userName || !loginDto.password) {
      throw new BadRequestException(
        'A user must have at least name and password defined',
      );
    }
    const user = await this.usersRepository.findOne({
      name: loginDto.userName,
      password: loginDto.password,
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
