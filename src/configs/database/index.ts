import { Sequelize, Dialect } from 'sequelize';
import { config } from 'dotenv';
import configDB from './config';

config();

const sequelize = new Sequelize(configDB.database as string, configDB.username as string, configDB.password, {
  ...configDB,
  dialect: configDB.dialect as Dialect,
});

const db = {
  sequelize,
};

export default db;
