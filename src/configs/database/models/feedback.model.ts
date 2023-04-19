import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User, { IUser } from './user.model';
import Product, { IProduct } from './product.model';

export interface IFeedback extends Model {
  id: string;
  user_id: string;
  product_id: string;
  rate: number;
  number_of_click: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Feedback = db.sequelize?.define<IFeedback>(
  'Feedback',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
      },
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Product,
      },
    },
    rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    number_of_click: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IFeedback>;

export default Feedback;