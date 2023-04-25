import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import Product from './product.model';

export interface ICartItem extends Model {
  id: number;
  product_id: number;
  cart_id: number;
  quantity: number;
  cart_price: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItem = db.sequelize?.define<ICartItem>(
  'CartItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: 'id',
      },
    },
    cart_id: {
      type: DataTypes.INTEGER,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    cart_price: {
      type: DataTypes.FLOAT,
      defaultValue: 1,
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<ICartItem>;

export default CartItem;
