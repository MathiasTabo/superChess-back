import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import { MongoRepository } from 'typeorm';
import RegisterDto from './dto/register.dto';

@Controller('register')
export default class RegisterController {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
  ) {}

  @Post()
  async create(@Body() registerDto: RegisterDto): Promise<User> {
    if (
      !registerDto
      || !registerDto.userName
      || !registerDto.password
      || !registerDto.confirmPassword
    ) {
      throw new BadRequestException(
        'A user must have at least name and password defined',
      );
    }
    const regExUserName = /^[0-9a-zA-Z]+$/;
    if (!registerDto.userName.match(regExUserName)) {
      throw new BadRequestException(
        'The user name must be alphanumeric',
      );
    }
    const regExPassword = /^[0-9a-zA-Z!@#$%^&*)(+=._-]+$/;
    if (!registerDto.password.match(regExPassword)) {
      throw new BadRequestException(
        'The password must be alphanumeric',
      );
    }
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException(
        'The password need to be the same than confirm password',
      );
    }
    const userAlreadyExist = await this.usersRepository.findOne({
      name: registerDto.userName,
    });
    if (userAlreadyExist) {
      throw new BadRequestException('The user name already exist');
    }
    const pet = {
      name: registerDto.userName,
      password: registerDto.password,
    };
    return this.usersRepository.save(new User(pet));
  }
}
