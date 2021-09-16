import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import LoginController from './login.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LoginController],
})
export default class LoginModule {}
