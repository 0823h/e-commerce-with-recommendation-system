import { DataTypes, Model, ModelStatic } from 'sequelize';
import User from './user.model';
import db from '@database';
export interface IAddress extends Model {
  id: number;
  user_id: number;
  country: string;
  province: string;
  city: string;
  detail: string;
}
const Address = db.sequelize?.define<IAddress>(
  'Address',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    country: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING
    },
    detail: {
      type: DataTypes.STRING
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IAddress>;
export default Address;

