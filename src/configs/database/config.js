// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

/** @type {import('sequelize').Options} */
const config = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '1',
  database: process.env.DB_NAME || 'tmdt_db',
  host: process.env.DB_HOSTNAME || '127.0.0.1',
  port: Number(process.env.DB_PORT || '8002'),
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
    useUTC: false,
    timezone: '+08:00',
  },
  pool: {
    min: 0,
    max: 350,
    idle: 10000,
    acquire: 220000
  },
  timezone: '+08:00',
  seederStorage: "sequelize",
  seederStorageTableName: "seeder",
  migrationStorage: "sequelize",
  migrationStorageTableName: "migration",
}

module.exports = config