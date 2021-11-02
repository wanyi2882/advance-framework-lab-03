const { response } = require("express");
const express = require("express")
const router = express.Router()

// #1 require in the Product model
const { Product } = require("../models")

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

router.get('/', async function(req,res){
    // #2 the model reporesents the entire table
    let products = await Product.collection().fetch();
    res.render('products/index',{
        'products': products.toJSON() // convert to json
    })
});

router.get('/add', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/add',{
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/add', async(req,res)=>{
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product();
            product.set('title', form.data.title);
            product.set('date', form.data.date);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('stock', form.data.stock);
            product.set('height', form.data.height);
            product.set('width', form.data.width);
            await product.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/add', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
});

module.exports = router;