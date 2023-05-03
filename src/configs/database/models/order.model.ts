import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User from './user.model';

export interface IOrder extends Model {
  id: number;
  user_id: number;
  order_amount: number;
  address: string;
  is_fraud: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Order = db.sequelize?.define<IOrder>(
  'Order',
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
    },
    order_amount: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
    },
    is_fraud: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IOrder>;

export default Order;
