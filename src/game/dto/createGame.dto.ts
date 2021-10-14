import { ObjectID } from "typeorm";

export default class CreateGameDto {
  players: string[];

  turn: number;

  state: number;
}
