import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User from './user.model';
import Address from './address.model';

export interface IOrder extends Model {
  id: number;
  user_id: number;
  total_order_amount: number;
  price: number;
  address_id: string;
  phone_number: string;
  email: string;
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
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    total_order_amount: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.FLOAT,
    },
    address_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Address,
        key: 'id'
      }
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    email: {
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
