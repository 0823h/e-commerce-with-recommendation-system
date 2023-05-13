import { Model, ModelStatic } from 'sequelize/types/model';
import db from '@database';
import { DataTypes } from 'sequelize';

export interface IOrderItem extends Model {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItem = db.sequelize?.define<IOrderItem>('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    unique: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
  },
  product_id: {
    type: DataTypes.INTEGER,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
  price: {
    type: DataTypes.FLOAT,
  },
}) as ModelStatic<IOrderItem>;

export default OrderItem;
