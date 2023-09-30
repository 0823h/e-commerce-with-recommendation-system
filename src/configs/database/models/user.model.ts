import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
export interface IUser extends Model {
  id: number;
  user_no: number;
  email: string;
  email_verified: boolean;
  phone_number: string;
  phone_number_verified: boolean;
  password: string;
  otp: string;
  first_name: string;
  last_name: string;
  address: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const User = db.sequelize?.define<IUser>('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  user_id: DataTypes.INTEGER,
  email: DataTypes.STRING,
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: true },
  phone_number: DataTypes.STRING,
  phone_number_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  password: DataTypes.STRING,
  otp: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  address: DataTypes.STRING,
  deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
}) as ModelStatic<IUser>;
export default User;
