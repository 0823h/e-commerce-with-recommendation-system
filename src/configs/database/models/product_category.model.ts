import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import Product from './product.model';
import Category from './category.model';

export interface IProductCategory extends Model {
  id: string;
  product_id: string;
  category_id: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategory = db.sequelize?.define<IProductCategory>(
  'ProductCategory',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    product_id: {
      type: DataTypes.STRING,
      references: {
        model: Product,
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.STRING,
      references: {
        model: Category,
        key: 'id',
      },
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IProductCategory>;

export default ProductCategory;
