import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Game from 'src/entity/game.entity';
import Piece from 'src/entity/piece.entity';
import { MongoRepository } from 'typeorm';
import CreateGameDto from './dto/createGame.dto';
import { isValidObjectId } from 'mongoose';
import JoinUserDto from './dto/joinUser.dto';

@Controller('game')
export default class GameController {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: MongoRepository<Game>,
    @InjectRepository(Piece)
    private readonly pieceRepository: MongoRepository<Piece>,
  ) { }

  @Get()
  async getGames(): Promise<Game[]> {
    return await this.gameRepository.find({ state: 0 });
  }

  @Post()
  async create(@Body() createGameDto: CreateGameDto): Promise<Game> {
    console.log(!createGameDto);
    console.log(!createGameDto.players);
    console.log(!createGameDto.state);
    console.log(!createGameDto.turn);
    if (
      !createGameDto
      || !createGameDto.players
      || createGameDto.turn !== 0
      || createGameDto.state !== 0
    ) {
      throw new BadRequestException(
        'A user must have at least name and password defined',
      );
    }
    var game:Game = await this.gameRepository.save(createGameDto);
    var pieces: Piece[] = [];
    for (var i:number = 0; i < 2; i++) {
      var color:boolean;
      var yy:number = 1;
      color = false;
      if (i == 1) {
        yy = 6;
        color = true;
      }
      for (var x = 0; x < 8; x++) {
        const pion = new Piece({ "room": game.id.toString(), value: 0 });
        pion.x = x;
        pion.y = yy;
        pion.color = color;
        pieces.push(pion);
      }
    }
    console.log(pieces);
    await this.pieceRepository.save(pieces);
    return game;
  }

  @Post('join')
  async addPlayer(@Body() joinUserDto: JoinUserDto): Promise<Game> {
    if (!isValidObjectId(joinUserDto.gameId)) {
      throw new NotFoundException();
    }
    const game = await this.gameRepository.findOne(joinUserDto.gameId);
    if (!game) {
      throw new NotFoundException();
    }
    game.id_string = joinUserDto.gameId.toString();
    game.players.push(joinUserDto.userId);
    //      game.playersColor.push(joinUserDto.color);
    await this.gameRepository.update(game.id, game)

    return game;
  }
}
