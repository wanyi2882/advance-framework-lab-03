const cartDataLayer = require('../dal/cart');

async function getShoppingCart(userId)  {
    return await cartDataLayer.getShoppingCartForUser(userId);
}

async function addItemToCart(userId,productId) {
    // check if the user has already added the product to the cart
    let cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId);

    if (cartItem) {
        // increase quantity by 1
        await cartDataLayer.updateQuantity(userId, productId, cartItem.get('quantity')+1);
        return true;
    } else {
        await cartDataLayer.createCartItem(userId, productId, 1);       
        return true;   
    }
}
// service layer must reflect business rules

async function updateQuantityInCart(userId, productId, newQuantity) {
 if (newQuantity > 0){
    await cartDataLayer.updateQuantity(userId, productId, newQuantity);
    return true;
 } else {
     return false;
 }
}

async function removeFromCart (userId, productId) {
    //to do: checks
    await cartDataLayer.removeFromCart(userId, productId)
    return true;
}

module.exports = { addItemToCart, getShoppingCart, updateQuantityInCart, removeFromCart };