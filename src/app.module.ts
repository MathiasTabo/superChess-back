import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ChessGateway from './app.gateway';
import Game from './entity/game.entity';
import User from './entity/user.entity';
import GameModule from './game/game.module';
import LoginModule from './login/login.module';
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
    TypeOrmModule.forFeature([User, Game]),
    RegisterModule,
    LoginModule,
    GameModule,
  ],
  providers: [ChessGateway],
})
export default class AppModule {}
