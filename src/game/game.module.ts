import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Game from 'src/entity/game.entity';
import Piece from 'src/entity/piece.entity';
import GameController from './game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Piece])],
  controllers: [GameController],
})
export default class GameModule {}
