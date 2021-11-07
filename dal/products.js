const {
    Product,
    MediaProperty,
    Tag
} = require('../models')

async function getProductById(productId) {
    let product = await Product.where({
        'id': productId
    }).fetch({
        'require': true
    });
    return product;
}

async function getAllCategories() {
    const allCategories = await MediaProperty.fetchAll().map(c => [c.get('id'), c.get('name')]);
    return allCategories;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')]);
    return allTags;
}

module.exports = { getProductById, getAllCategories, getAllTags}