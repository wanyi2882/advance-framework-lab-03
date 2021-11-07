const bookshelf = require('../bookshelf')

// create a model
// a model is a class that represents one
// table in our databases
// first arg: name of the model
// second arg: settings in the form of an object

const Product = bookshelf.model('Product',{
    'tableName': 'posters',
    MediaProperty() {
        return this.belongsTo('MediaProperty')
    },
    Tag() {
        return this.belongsToMany('Tag');
    }
});

const MediaProperty = bookshelf.model('MediaProperty',{
    'tableName': 'media_properties',
    products(){
        return this.hasMany('Product')
    }
});

const Tag = bookshelf.model('Tag',{
    'tableName': 'tags',
    products(){
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User',{
    'tableName': 'users'
})

module.exports = { Product, MediaProperty, Tag, User }