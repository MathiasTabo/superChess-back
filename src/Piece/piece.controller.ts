import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Piece from 'src/entity/piece.entity';
import { MongoRepository } from 'typeorm';
import PieceDto from './dto/piece.dto';
// import RegisterDto from './dto/register.dto';

@Controller('piece')
export default class PieceController {
  constructor(
    @InjectRepository(Piece)
    private readonly piecesRepository: MongoRepository<Piece>,
  ) {}

  // @Post()
  // async create(@Body() pieceDto: PieceDto): Promise<Piece[]> {
  // if (
  //   !pieceDto
  //   || !pieceDto.room
  // ) {
  //   throw new BadRequestException(
  //     'A user must have at least name and password defined',
  //   );
  // }
  // var pieces: Piece[] = [];
  // for (var i = 0; i < 2; i++) {
  //   var yy = 1;
  //   if (i == 1) {
  //     yy = 6;
  //   }
  //   for (var x = 0; x < 8; x++) {
  //     const pion = new Piece({ "room": pieceDto.room, value: 0 });
  //     pion.x = x;
  //     pion.y = yy;
  //     pieces.push(pion);
  //   }
  // }
  // return this.piecesRepository.save(pieces);
  // }
}
