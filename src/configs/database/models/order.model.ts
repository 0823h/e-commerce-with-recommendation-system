import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User from './user.model';
import Address from './address.model';
import PaymentMethod from './payment_method.model';
import Admin from './admin.model';

export interface IOrder extends Model {
  id: number;
  user_id: number;
  total_order_amount: number;
  price: number;
  address: string;
  phone_number: string;
  email: string;
  payment_method_id: number;
  status: string;
  is_fraud: boolean;
  created_by: string;
  customer_name: string;
  ship_assigned_to: number;
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
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Vietnam'
    },
    status: {
      type: DataTypes.ENUM('Preparing order', 'Awaiting pickup', 'Picking up', 'Order picked up', 'Delivering', 'Delivered successfully', 'Delivery failed'),
      allowNull: false,
      defaultValue: 'Preparing order'
    },
    created_by: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: "user"
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      references: {
        model: PaymentMethod,
        key: 'id',
      },
      allowNull: false,
      // defaultValue: 1
    },
    customer_name: {
      type: DataTypes.STRING,
    },
    is_fraud: {
      type: DataTypes.BOOLEAN,
    },
    assigned_to_shipper: {
      type: DataTypes.INTEGER,
      references: {
        model: Admin,
        key: 'id'
      }
    }
  },
  {
    paranoid: true,
  }
) as ModelStatic<IOrder>;

export default Order;
