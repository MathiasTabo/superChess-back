import {
  SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ConsoleLogger, Logger, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectID } from 'typeorm';
import { ObjectId } from 'mongoose';
import Piece from './entity/piece.entity';
import PieceModule from './Piece/piece.module';
import Game from './entity/game.entity';
import GameController from './game/game.controller';

type Pos = {
  x: number,
  y: number,
};

// type Piece = {
//   x: number,
//   y: number,
//   id: number,
//   color: boolean
// };

@WebSocketGateway({ namespace: '/chat' })
export class ChessGateway implements OnGatewayInit {
  @WebSocketServer() wss: Server;

  @InjectRepository(Game)
  private readonly gameRepository: MongoRepository<Game>;

  @InjectRepository(Piece)
  private readonly piecesRepository: MongoRepository<Piece>;

  private logger: Logger = new Logger('ChatGateway');

  private user_by_room: Map<string, number> = new Map<string, number>();

  private board_by_room: Map<string, Piece[][]> = new Map<string, Piece[][]>();

  private games: Map<string, Game> = new Map<string, Game>();

  private chess: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],

    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  findePieceByPos(pos_x: number, pos_y: number, pieces: Piece[]): Piece {
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].x === pos_x && pieces[i].y === pos_y) {
        console.log(pieces[i]);
        return pieces[i];
      }
    }
    return null;
  }

  gameHasPlayer(players: string[], player: string): boolean {
    for (let i: number = 0; i < players.length; i++) {
      if (player === players[i]) {
        return true;
      }
    }
    return false;
  }

  getMoveFromPos(x: number, y: number, room: string): Pos[] {
    const res: Pos[] = [];
    const piece: Piece = this.board_by_room.get(room)[y][x];
    if (piece) {
      if (piece.value === 0) {
        let axe_y: number = -1;
        var no_move: number = 6;
        if (piece.color) {
          axe_y = -1;
          var no_move: number = 1;
        }
        let pos: Pos;
        pos.x = piece.x;
        pos.y = piece.y + 1 * axe_y;
        res.push(pos1);
        if (piece.y === no_move) {
          var pos1: Pos;
          pos1.x = piece.x;
          pos1.y = piece.y + 2 * axe_y;
          res.push(pos1);
        }
      }
    }
    return res;
  }

  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: { sender: string, room: string, x: number, y: number }) {
    if (this.user_by_room.get(message.room) === 2) {
      console.log(this.games.get(message.room));
      if (message.sender === this.games.get(message.room).players[this.games.get(message.room).turn]) {
        if (message.x >= 0 && message.x <= 7 && message.y >= 0 && message.y <= 7) {
          const mess: Pos[] = this.getMoveFromPos(message.x, message.y, message.room);
          client.emit('chatToClient', mess);
        }
      }
    }
    //    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: Socket, message: { room: string, player: string }) {
    // console.log(this.user_by_room.get(room));
    const { room } = message;
    const { player } = message;
    console.log(`room = ${room}`);
    console.log(`player = ${player}`);

    if (this.user_by_room.has(room)) {
      if (this.user_by_room.get(room) === 1 && this.games.get(room) !== undefined && this.games.get(room).players && this.games.get(room).players.length === 2) {
        console.log(`connect room = ${room}`);
        console.log(`first client = ${player}`);

        client.join(room);
        this.user_by_room.set(room, this.user_by_room.get(room) + 1);
        console.log(`player: ${player} conected to room: ${room}nb players connected: ${this.user_by_room.get(room)}`);

        client.emit('joinedRoom', room);
      }
    } else if (this.user_by_room.has(room) === false) {
      const game: Game = await this.gameRepository.findOne({ id_string: room });
      console.log(player);
      console.log(game);
      if (game !== undefined && game.players) {
        console.log(`connect room = ${room}`);
        console.log(`first client = ${player}`);
        console.log(`game players = ${game.players}`);
        if (this.gameHasPlayer(game.players, player)) {
          console.log('players found !!');

          client.join(room);
          this.user_by_room.set(room, 1);
          client.emit('joinedRoom', room);

          console.log(`player: ${player} conected to room: ${room}nb players connected: ${this.user_by_room.get(room)}`);

          const pieceInDb: Piece[] = await this.piecesRepository.find({ room });
          let pions: Piece[][];
          pions = [];
          for (let y: number = 0; y < this.chess.length; y++) {
            let pion: Piece[];
            pion = [];
            for (let x: number = 0; x < this.chess[y].length; x++) {
              pion.push(this.findePieceByPos(x, y, pieceInDb));
            }
            pions.push(pion);
          }
          this.board_by_room.set(room, pions);

          console.log('Board: ');
          console.log(this.board_by_room.get(room));
          this.games.set(room, game);
        }
      } else {
        console.log('players not found !!');
      }
    }
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    this.user_by_room.set(room, this.user_by_room.get(room) - 1);
    client.emit('leftRoom', room);
  }
}
