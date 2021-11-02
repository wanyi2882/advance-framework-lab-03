// Underlying tech for bookshelf
const knex = require('knex')(
    {
        'client': 'mysql',
        'connection':{
            'user': 'foo',
            'password': 'bar',
            'database': 'postershop'
        }
    }
);

// create the bookshelf
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;