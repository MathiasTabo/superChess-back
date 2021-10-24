import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Game from 'src/entity/game.entity';
import User from 'src/entity/user.entity';
import GameController from './game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User])],
  controllers: [GameController],
})
export default class GameModule {}
