import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import Product from './product.model';

export interface IVariant extends Model {
  id: number;
  product_id: number;
  size: string;
  colour: string;
  quantity: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Variant = db.sequelize?.define<IVariant>('Variant', {
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
  size: DataTypes.STRING,
  colour: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
}) as ModelStatic<IVariant>;

export default Variant;
