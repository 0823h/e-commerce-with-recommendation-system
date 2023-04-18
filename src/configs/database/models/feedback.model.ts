import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import { IUser } from './user.model';
import { IProduct } from './product.model';

export interface IFeedback extends Model {
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
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
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
