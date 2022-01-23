const config = require('./utils/config');
const types = require('pg').types;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMPTZ_OID, val => val);
types.setTypeParser(TIMESTAMP_OID, val => val);

const knex = require('knex');
const knexConfig = {
    development : {
        client : 'pg',
        connection : {
            host : '127.0.0.1',
            user : config.DB_USER,
            password : config.DB_PASSWORD,
            database : config.DB_NAME
        }
    },
    production : {
        client : 'pg',
        connection : config.DATABASE_URL
    }
};
const environment = config.DB_ENV;
module.exports = knex(knexConfig[environment])