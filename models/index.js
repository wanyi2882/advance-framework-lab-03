const bookshelf = require('../bookshelf')

// create a model
// a model is a class that represents one
// table in our databases
// first arg: name of the model
// second arg: settings in the form of an object

const Product = bookshelf.model('Product',{
    'tableName': 'posters'
});

const User = bookshelf.model('User',{
    tableName: 'users'
})
module.exports = { Product, User }