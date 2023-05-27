import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface ICategory extends Model {
  id: string;
  name: string;
  slug: string;
  description: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Category = db.sequelize?.define<ICategory>(
  'Category',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.STRING,
  },
  {
    paranoid: true,
  }
) as ModelStatic<ICategory>;

export default Category;
