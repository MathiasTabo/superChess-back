import {
  Entity, ObjectID, ObjectIdColumn, Column,
} from 'typeorm';

@Entity('game')
export default class Game {
  @ObjectIdColumn() id: ObjectID;

  @Column() id_string: string;

  @Column() players: string[];

  @Column() turn: number;

  @Column() state: number;

  constructor(game?: Partial<Game>) {
    Object.assign(this, game);
  }
}
