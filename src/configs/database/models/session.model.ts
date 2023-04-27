import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';

export interface ISession extends Model {
  id: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Session = db.sequelize?.define<ISession>(
  'Session',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  },
  {}
) as ModelStatic<ISession>;

export default Session;
