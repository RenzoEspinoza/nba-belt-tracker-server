module.exports = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'postgresRenzo',
        database : 'nba_title_belt_tracker'
    }
});