import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
export interface IUserCount extends Model {
  id: number,
  user_count: number,
}
const UserCount = db.sequelize?.define<IUserCount>(
  'UserCount',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user_count: DataTypes.INTEGER
  }
) as ModelStatic<IUserCount>;
export default UserCount;
