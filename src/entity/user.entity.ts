import {
  Entity, ObjectID, ObjectIdColumn, Column,
} from 'typeorm';

@Entity('user')
export default class User {
  @ObjectIdColumn() id: ObjectID;

  @Column() name: string;

  @Column() password: string;

  @Column() friend: [string];

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
