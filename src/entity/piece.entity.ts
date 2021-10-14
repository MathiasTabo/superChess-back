import {
  Entity, ObjectID, ObjectIdColumn, Column,
} from 'typeorm';

@Entity('piece')
export default class Piece {
  @ObjectIdColumn() id: ObjectID;

  @Column() room: string;

  @Column() x: number;

  @Column() y: number;

  @Column() value: number;

  @Column() color: boolean;


  constructor(piece?: Partial<Piece>) {
    Object.assign(this, piece);
  }
}
