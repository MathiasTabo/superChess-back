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
import User from 'src/entity/user.entity';
import { MongoRepository } from 'typeorm';
import { isValidObjectId } from 'mongoose';
import CreateGameDto from './dto/createGame.dto';
import JoinUserDto from './dto/joinUser.dto';

@Controller('game')
export default class GameController {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: MongoRepository<Game>,
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    // private logger: Logger = new Logger('GameControllers')
  ) { }

  @Get()
  async getGames(): Promise<Game[]> {
    return this.gameRepository.find({ state: 0 });
  }

  @Post()
  async create(@Body() createGameDto: CreateGameDto): Promise<Game> {
    // this.logger.log(!createGameDto);
    // this.logger.log(!createGameDto.players);
    // this.logger.log(!createGameDto.state);
    // this.logger.log(!createGameDto.turn);
    if (
      !createGameDto
      || !createGameDto.players
      || createGameDto.turn !== 0
      || createGameDto.state !== 0
    ) {
      throw new BadRequestException(
        'A user must have at least players and state and turn defined',
      );
    }
    const user = await this.userRepository.findOne({
      string_id: createGameDto.players[0],
    });
    if (!user) {
      throw new BadRequestException(
        'User_id must be valid.',
      );
    }
    let game:Game = await this.gameRepository.save(createGameDto);
    game = await this.gameRepository.findOne(game.id);
    game.id_string = game.id.toString();
    await this.gameRepository.update(game.id, game);
    return game;
  }

  @Post('join')
  async addPlayer(@Body() joinUserDto: JoinUserDto): Promise<Game> {
    if (!isValidObjectId(joinUserDto.gameId)) {
      throw new NotFoundException();
    }
    const user = await this.userRepository.findOne({
      string_id: joinUserDto.userId,
    });
    if (!user) {
      throw new BadRequestException(
        'User_id must be valid.',
      );
    }
    const game = await this.gameRepository.findOne(joinUserDto.gameId);
    if (!game) {
      throw new NotFoundException();
    }
    game.state = 1;
    game.players.push(joinUserDto.userId);
    await this.gameRepository.update(game.id, game);

    return game;
  }
}
