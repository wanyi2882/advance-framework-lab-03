const express = require("express")
const router = express.Router()

// #1 require in the Product model
const { Product, MediaProperty, Tag } = require("../models")

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

router.get('/', async function (req, res) {
    // #2 the model reporesents the entire table
    let products = await Product.collection().fetch({
        withRelated: ['MediaProperty', 'Tag']
    });
    res.render('products/index', {
        'products': products.toJSON() // convert to json
    })
});

router.get('/add', async (req, res) => {
    const media_properties = await MediaProperty.fetchAll().map(m => [m.get('id'), m.get('name')]);

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(media_properties, allTags);
    res.render('products/add', {
        'form': productForm.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })
});

router.post('/add', async (req, res) => {
    const media_properties = await MediaProperty.fetchAll().map(m => [m.get('id'), m.get('name')]);

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(media_properties, allTags);

    productForm.handle(req, {
        'success': async (form) => {
            // separate out tags from the other product data
            // as not to cause an error when we create
            // the new product
            let { tags, ...productData } = form.data;

            // 2. Save data from form into the new product instance
            const product = new Product(productData);
            await product.save();

            // save the many to many relationship
            if (tags) {
                await product.Tag().attach(tags.split(","));
            }

            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/add', {
                'form': form.toHTML(bootstrapField),
                'cloudinaryName': process.env.CLOUDINARY_NAME,
                'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
                'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
});

router.get('/:product_id/update', async (req, res) => {
    // Retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['Tag']
    });

    // fetch all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    // fetch all the categories
    const media_properties = await MediaProperty.fetchAll().map((media_property) => {
        return [media_property.get('id'), media_property.get('name')];
    })

    const productForm = createProductForm(media_properties, allTags);

    // Fill in the existing values
    productForm.fields.title.value = product.get('title')
    productForm.fields.cost.value = product.get('cost')
    productForm.fields.date.value = product.get('date')
    productForm.fields.description.value = product.get('description')
    productForm.fields.stock.value = product.get('stock')
    productForm.fields.height.value = product.get('height')
    productForm.fields.width.value = product.get('width')
    productForm.fields.media_property_id.value = product.get('media_property_id');

    // fill in the multi-select for the tags
    let selectedTags = await product.related('Tag').pluck('id');
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
});

// Process the update form
router.post('/:product_id/update', async (req, res) => {

    // Fetch the data to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated: ['Tag']
    })

    // fetch all the categories
    const media_properties = await MediaProperty.fetchAll().map((media_property) => {
        return [media_property.get('id'), media_property.get('name')];
    })

    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')]);

    // Process the form
    const productForm = createProductForm(media_properties, allTags)
    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data
            product.set(productData)
            product.save()

            // update the tags

            let tagIds = tags.split(',');
            let existingTagIds = await product.related('Tag').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false);
            await product.Tag().detach(toRemove);

            // add in all the tags selected in the form
            await product.Tag().attach(tagIds);

            res.redirect('/products')
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
});

// Delete a product
router.get('/:product_id/delete', async (req, res) => {
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
router.post('/:product_id/delete', async (req, res) => {
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