const {
    Product,
    MediaProperty,
    Tag
} = require('../models')

async function getAllProducts(){
    return await Product.fetchAll()
}

//getProductById
async function findPoster(productId) {
    let product = await Product.where({
        'id': productId
    }).fetch({
        'require': true
    });
    return product;
}

//getAllCategories
async function getMediaProperties() {
    const allCategories = await MediaProperty.fetchAll().map(c => [c.get('id'), c.get('name')]);
    return allCategories;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')]);
    return allTags;
}

module.exports = { findPoster, getMediaProperties, getAllTags, getAllProducts }