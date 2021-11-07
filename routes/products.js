const express = require("express")
const router = express.Router()

// #1 require in the Product model
const { Product, MediaProperty, Tag } = require("../models")

// import in the Forms
const { bootstrapField, createProductForm, createSearchForm } = require('../forms');

router.get('/', async function (req, res) {
    const allCategories = await MediaProperty.fetchAll().map(c => [c.get('id'), c.get('name')]);
    allCategories.unshift([0, 'All categories']);
   
    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')]);
    let searchForm = createSearchForm(allCategories, allTags);


    searchForm.handle(req, {
        'empty': async (form) => {
            // the model represents the entire table
            let products = await Product.collection().fetch({
                'withRelated': ['MediaProperty', 'Tag']
            });

            res.render('products/index', {
                'products': products.toJSON(), // convert the results to JSON
                'searchForm': form.toHTML(bootstrapField),
                'allCategories': allCategories,
                'allTags': allTags
            })
        },
        'success': async (form) => {
            let name = form.data.name;
            let min_cost = form.data.min_cost;
            let max_cost = form.data.max_cost;
            let category = parseInt(form.data.category);
            let tags = form.data.tags;
       
            // create a query that is the eqv. of "SELECT * FROM products WHERE 1"
            // this query is deferred because we never call fetch on it.
            // we have to execute it by calling fetch onthe query
            let q = Product.collection();
            
            // if name is not undefined, not null and not empty string
            if (name) {
                // add a where clause to its back
                q.where('name', 'like', `%${name}%`);
            }

            if (min_cost) {
                q.where('cost', '>=', min_cost);
            }

            if (max_cost) {
                q.where('cost', '<=', max_cost);
            }

            // check if cateogry is not 0, not undefined, not null, not empty string
            if (category) {
                q.where('category_id', '=', category);
            }

            // if tags is not empty
            if (tags) {
                let selectedTags = tags.split(',');
                q.query('join', 'products_tags', 'products.id', 'product_id')
                 .where('tag_id', 'in',selectedTags);
            }

            // execute the query
            let products = await q.fetch({
                'withRelated':['category', 'tags']
            });
            res.render('products/index', {
                'products': products.toJSON(), // convert the results to JSON
                'searchForm': form.toHTML(bootstrapField),
                'allCategories': allCategories,
                'allTags': allTags
            })
        },
        'error': async(form) =>{
             // the model represents the entire table
             let products = await Product.collection().fetch({
                'withRelated': ['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(), // convert the results to JSON
                'searchForm': form.toHTML(bootstrapField),
                'allCategories': allCategories,
                'allTags': allTags
            })
        }
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
            req.flash("success_messages", `New Product ${product.get('name')} has been created`)
            
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
        'product': product.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
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