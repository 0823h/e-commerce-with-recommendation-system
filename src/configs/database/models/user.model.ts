import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface IUser extends Model {
  id: string;
  email: string;
  email_verified: boolean;
  phone_number: string;
  phone_number_verified: boolean;
  password: string;
  otp: string;
  first_name: string;
  last_name: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const User = db.sequelize?.define<IUser>(
  'User',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    email: DataTypes.STRING,
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    phone_number: DataTypes.STRING,
    phone_number_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    password: DataTypes.STRING,
    otp: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
  },
  {
    paranoid: true,
  }
) as ModelStatic<IUser>;

export default User;
