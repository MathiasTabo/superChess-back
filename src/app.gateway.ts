import {
  SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import Game from './entity/game.entity';

type Pos = {
  x: number,
  y: number,
};

type Piece = {
  x: number,
  y: number,
  id: number,
  color: boolean
};

function gameHasPlayer(players: string[], player: string): boolean {
  for (let i: number = 0; i < players.length; i += 1) {
    if (player === players[i]) {
      return true;
    }
  }
  return false;
}

function isSelectPosGood(allPos: Pos[], x: number, y: number): boolean {
  for (let i: number = 0; i < allPos.length; i += 1) {
    if (allPos[i].x === x && allPos[i].y === y) {
      return true;
    }
  }
  return false;
}

@WebSocketGateway({ namespace: '/chess' })
export default class ChessGateway implements OnGatewayInit {
  @WebSocketServer() wss: Server;

  @InjectRepository(Game)
  private readonly gameRepository: MongoRepository<Game>;

  private logger: Logger = new Logger('ChatGateway');

  private user_by_room: Map<string, number> = new Map<string, number>();

  private board_by_room: Map<string, Piece[][]> = new Map<string, Piece[][]>();

  private PosiblePos: Pos[] = undefined;

  private playerConected: Map<string, string[]> = new Map<string, string[]>();

  private targetPos: Pos = undefined;

  private games: Map<string, Game> = new Map<string, Game>();

  private chess: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],

    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  afterInit() {
    this.logger.log('Initialized!');
  }

  getMoveFromPos(x: number, y: number, room: string): Pos[] {
    const res: Pos[] = [];
    const board: Piece[][] = this.board_by_room.get(room);
    const piece: Piece = this.board_by_room.get(room)[y][x];
    if (piece) {
      if (piece.id === 1) {
        let axeY: number = 1;
        // var noMove: number = 6;
        let noMove: boolean = false;
        if ((y === 1 && piece.color === false) || (y === 6 && piece.color === true)) {
          noMove = true;
        }
        if (piece.color) {
          axeY = -1;
        }
        if (y + 1 * axeY < 0 || y + 1 * axeY > 7) {
          return res;
        }
        if (board[y + 1 * axeY][x] === null) {
          res.push({
            x,
            y: y + 1 * axeY,
          });
          if (noMove && board[y + 2 * axeY][x] === null) {
            res.push({
              x,
              y: y + 2 * axeY,
            });
          }
        }
        if (piece.x + 1 <= 7 && board[y + 1 * axeY][piece.x + 1] !== null
          && board[y + 1 * axeY][piece.x + 1].color !== piece.color) {
          res.push({
            x: piece.x + 1,
            y: piece.y + 1 * axeY,
          });
        }
        if (piece.x - 1 >= 0 && board[y + 1 * axeY][piece.x - 1] !== null
          && board[y + 1 * axeY][piece.x - 1].color !== piece.color) {
          res.push({
            x: piece.x - 1,
            y: piece.y + 1 * axeY,
          });
        }
      }
    }
    return res;
  }

  firstUserJoin(client: Socket, room: string, player: string, game: Game): boolean {
    if (!game || !game.players || !gameHasPlayer(game.players, player)) {
      client.emit('joinedRoom', 'Game or player not found !!');
      this.logger.log('game or player not found !!');
      return false;
    }

    // this.logger.log(`player: ${player} conected to room: ${room} nb players connected:
    // ${this.user_by_room.get(room)} and game of the room is ${game}`);
    let pionTab: Piece[][] = [];
    pionTab = [];
    let color: boolean = false;
    let pions: Piece[];
    for (let y: number = 0; y < this.chess.length; y += 1) {
      pions = [];
      if (y >= 6) {
        color = true;
      }
      for (let x: number = 0; x < this.chess[y].length; x += 1) {
        if (this.chess[y][x] !== 0) {
          const piece: Piece = {
            x,
            y,
            id: this.chess[y][x],
            color,
          };
          pions.push(piece);
        } else {
          pions.push(null);
        }
      }
      pionTab.push(pions);
    }
    this.board_by_room.set(room, pionTab);

    const players: string[] = [];
    players.push(player);
    this.playerConected.set(room, players);
    this.logger.log('Board: ');
    this.logger.log(this.board_by_room.get(room));
    client.join(room);
    this.user_by_room.set(room, 1);
    client.emit('joinedRoom', `Joined room ${room}`);
    return true;
  }

  secondUserJoin(client: Socket, room: string, player: string, game: Game): boolean {
    if (this.user_by_room.get(room) !== 1) {
      client.emit('joinedRoom', 'Cannot be more player than 2 player in a room !!');
      this.logger.log('game or player not found !!');
      return false;
    }
    if (!game || !game.players || game.players.length !== 2) {
      client.emit('joinedRoom', 'You must join the game');
      this.logger.log('game or player not found !!');
      return false;
    }
    if (!gameHasPlayer(game.players, player)) {
      client.emit('joinedRoom', 'Player not found.');
      this.logger.log('game or player not found !!');
      return false;
    }
    this.logger.log(`player: ${player} conected to room: ${room}nb players connected: ${this.user_by_room.get(room)}`);

    this.games.set(room, game);
    client.join(room);
    this.user_by_room.set(room, this.user_by_room.get(room) + 1);
    client.emit('joinedRoom', `Joined room ${room}`);
    return true;
  }

  @SubscribeMessage('GameToServer')
  handleMessage(client: Socket, message: { room: string, player: string, x: number, y: number }) {
    const { room } = message;
    const { player } = message;
    const { x } = message;
    const { y } = message;
    this.logger.log(`room = ${room}`);
    this.logger.log(`player = ${player}`);
    this.logger.log(`room = ${room}`);
    this.logger.log(`player = ${player}`);
    this.logger.log(`nb_user = ${this.user_by_room.get(message.room)}`);
    // this.logger.log(`game_state = ${this.games.get(room).state}`);
    if (!room || !player) {
      client.emit('GameToClient', 'room or player must be defined.');
      this.logger.log('game or player not found !!');
      return;
    }

    if (this.user_by_room.get(message.room) === 1) {
      client.emit('GameToClient', 'Wait second player');
    }
    if (this.user_by_room.get(message.room) === 2) {
      if (this.games.get(room).state === 1) {
        const game: Game = this.games.get(room);
        game.state = 2;
        this.games.set(room, game);
        this.wss.to(message.room).emit('GameToClient', 'Start');
        return;
      }
      if (this.games.get(room).state === 2) {
        this.logger.log(this.games.get(room).players[this.games.get(message.room).turn]);
        this.logger.log(player);

        if (this.games.get(room).players[this.games.get(room).turn] === player) {
          if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
            const board: Piece[][] = this.board_by_room.get(room);
            if (this.PosiblePos === undefined || this.PosiblePos.length === 0
               || !isSelectPosGood(this.PosiblePos, x, y)) {
              if (board[y][x] !== null
                && ((board[y][x].color === false && this.games.get(room).turn === 1)
                || (board[y][x].color === true && this.games.get(room).turn === 0))) {
                this.targetPos = {
                  x,
                  y,
                };
                this.PosiblePos = this.getMoveFromPos(x, y, room);
                client.emit('GameToClient', this.PosiblePos);
              } else {
                client.emit('GameToClient', []);
              }
            } else {
              board[y][x] = board[this.targetPos.y][this.targetPos.x];
              board[y][x].x = x;
              board[y][x].y = y;
              board[this.targetPos.y][this.targetPos.x] = null;
              this.PosiblePos = undefined;
              this.targetPos = undefined;
              const game: Game = this.games.get(room);
              game.turn += 1;
              if (game.turn > 1) {
                game.turn = 0;
              }
              this.wss.to(message.room).emit('GameToClient', board);
            }
          }
        } else {
          client.emit('GameToClient', 'Not your turn.');
        }
      }
    }
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: Socket, message: { room: string, player: string }) {
    if (!message || !message.room || !message.player) {
      client.emit('joinedRoom', 'messsage must be defined corecly');
      return;
    }
    const { room } = message;
    const { player } = message;
    this.logger.log(`room = ${room}`);
    this.logger.log(`player = ${player}`);

    const game: Game = await this.gameRepository.findOne({ id_string: room });

    if (this.user_by_room.has(room) === false) {
      this.firstUserJoin(client, room, player, game);
    } else if (this.user_by_room.has(room)) {
      if (this.playerConected.has(room) && this.playerConected.get(room).length === 1
       && this.playerConected.get(room)[0] !== player) {
        this.secondUserJoin(client, room, player, game);
      } else {
        client.emit('joinedRoom', 'User has alredy join the room');
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
