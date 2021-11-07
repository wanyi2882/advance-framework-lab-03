// Underlying tech for bookshelf
const knex = require('knex')(
    {
        'client': process.env.DB_DRIVER,
        'connection':{
            'user': process.env.DB_USER,
            'password': process.env.DB_PASSWORD,
            'database': process.env.DB_DATABASE
        }
    }
);

// create the bookshelf
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;