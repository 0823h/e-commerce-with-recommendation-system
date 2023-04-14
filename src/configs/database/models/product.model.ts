import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface IProduct extends Model {
  id: string;
  name: string;
  description: string;
  images: string[];
  rating: number;
  price: number;
  quantity: number;
  sold_amount: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Product = db.sequelize?.define<IProduct>(
  'Product',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IProduct>;

export default Product;