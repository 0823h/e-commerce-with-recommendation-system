import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
export interface IGuest extends Model {
  id: number;
  user_id: number;
  cookie_id: number;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const Guest = db.sequelize?.define<IGuest>(
  'Guest',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    user_id: DataTypes.INTEGER,
    cookie_id: DataTypes.STRING,
    deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  }
) as ModelStatic<IGuest>;
export default Guest;