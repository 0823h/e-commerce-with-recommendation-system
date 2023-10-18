import { Model, ModelStatic } from 'sequelize/types/model';
import db from '@database';
import { DataTypes } from 'sequelize';
import Order from './order.model';
import Variant from './variant.model';

export interface IOrderItem extends Model {
  id: number;
  order_id: number;
  variant_id: string;
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
    references: {
      model: Order,
      key: 'id',
    },
  },
  variant_id: {
    type: DataTypes.STRING,
    references: {
      model: Variant,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
  price: {
    type: DataTypes.FLOAT,
  },
}) as ModelStatic<IOrderItem>;

export default OrderItem;
