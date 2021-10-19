import { ObjectID } from 'typeorm';

export default class JoinUserDto {
  gameId: ObjectID;

  userId: string;
}
