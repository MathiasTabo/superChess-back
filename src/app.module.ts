import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entity/user.entity';
import LoginModule from './login/login.module';
import RegisterModule from './register/register.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost:27017/jsfullstack',
      database: 'jsfullstack',
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
    TypeOrmModule.forFeature([User]),
    RegisterModule,
    LoginModule,
  ],
})
export default class AppModule {}
