import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface IAdmin extends Model {
  id: number;
  username: string;
  password: string;
  full_name: string;
  role: string;
}

const Admin = db.sequelize?.define<IAdmin>(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
) as ModelStatic<IAdmin>;

export default Admin;
