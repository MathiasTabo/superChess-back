import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Piece from 'src/entity/piece.entity';
import PieceController from './piece.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Piece])],
  controllers: [PieceController],
})
export default class PieceModule {}
