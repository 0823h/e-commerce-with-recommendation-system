import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface IProduct extends Model {
  id: number;
  product_no: number;
  name: string;
  description: string;
  main_image: string;
  sub_images: string[];
  rating: number;
  original_price: number;
  current_price: number;
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
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    main_image: DataTypes.STRING,
    sub_images: DataTypes.ARRAY(DataTypes.STRING),
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    original_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    current_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IProduct>;

export default Product;
