const { response } = require("express");
const express = require("express")
const router = express.Router()

// #1 require in the Product model
const { Product } = require("../models")

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');
const { create } = require("hbs");

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

router.get('/:product_id/update', async(req,res)=>{
    // Retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const productForm = createProductForm();

    // Fill in the existing values
    productForm.fields.title.value = product.get('title')
    productForm.fields.cost.value = product.get('cost')
    productForm.fields.date.value = product.get('date')
    productForm.fields.description.value = product.get('description')
    productForm.fields.stock.value = product.get('stock')
    productForm.fields.height.value = product.get('height')
    productForm.fields.width.value = product.get('width')

    res.render('products/update',{
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
});

// Process the update form
router.post('/:product_id/update', async(req,res)=>{
    // Fetch the data to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    // Process the form
    const productForm = createProductForm()
    productForm.handle(req,{
        'success': async(form) => {
            product.set(form.data)
            product.save()
            res.redirect('/products')
        },
        'error': async(form) => {
            res.render('products/update',{
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
});

// Delete a product
router.get('/:product_id/delete', async(req,res) => {
    // fetch the data that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    res.render('products/delete', {
        'product': product.toJSON()
    })
})

// process the delete
router.post('/:product_id/delete', async(req,res) => {
    // fetch the data we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    await product.destroy();
    res.redirect('/products')
})


module.exports = router;