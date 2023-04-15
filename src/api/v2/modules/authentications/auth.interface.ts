import { IUser } from '@src/configs/database/models/user.model';
import { Optional } from 'sequelize';

export interface IAuthRegister
  extends Optional<IUser, 'first_name' | 'last_name' | 'email' | 'phone_number' | 'password'> {}

export interface IAuthLogin {
  email: string;
  password: string;
}
