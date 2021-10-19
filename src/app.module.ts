import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertController } from './alert.controller';
import { AlertGateway } from './alert.gateway';
import { ChessGateway } from './app.gateway';
import Game from './entity/game.entity';
import Piece from './entity/piece.entity';
import User from './entity/user.entity';
import GameController from './game/game.controller';
import GameModule from './game/game.module';
import LoginModule from './login/login.module';
import PieceModule from './Piece/piece.module';
import RegisterModule from './register/register.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URI,
      database: process.env.DB_NAME,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
    TypeOrmModule.forFeature([User, Piece, Game]),
    RegisterModule,
    LoginModule,
    PieceModule,
    GameModule,
  ],
  controllers: [AlertController],
  providers: [AlertGateway, ChessGateway],
})
export default class AppModule {}
