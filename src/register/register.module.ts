import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import RegisterController from './register.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RegisterController],
})
export default class RegisterModule {}
