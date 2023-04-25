import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User from './user.model';

export interface ICart extends Model {
  id: number;
  user_id: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Cart = db.sequelize?.define<ICart>(
  'Cart',
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
  },
  {
    paranoid: true,
  }
) as ModelStatic<ICart>;

export default Cart;
