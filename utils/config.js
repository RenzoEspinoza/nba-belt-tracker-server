require('dotenv').config();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_ENV = process.env.DB_ENV;
const DEPLOY_HOOK = process.env.DEPLOY_HOOK;

module.exports = {
  PORT,
  DATABASE_URL,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_ENV,
  DEPLOY_HOOK,
}