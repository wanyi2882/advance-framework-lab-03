// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control mx-3 mb-2');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group mx-3 mb-2">' + label + widget + error + '</div>';
};

// Create product Form
const createProductForm = (media_properties, tags) => {
    return forms.create({
        'title': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            validators:[validators.integer(), validators.min(0)]
        }),
        'date': fields.date({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },            
            validators:[validators.date()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            }
        }),
        'stock': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            validators:[validators.integer(), validators.min(0)]

        }),
        'height': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            validators:[validators.integer(), validators.min(0)]
        }),
        'width': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            validators:[validators.integer(), validators.min(0)]
        }),
        'media_property_id': fields.string({
            label: 'Media Property',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            widget: widgets.select(),
            choices: media_properties
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices:tags
        }),
        'image_url':fields.string({
            cssClasses: {
                label: ['form-label mx-3 fw-bold']
            },
            widget: widgets.hidden()
        })
    })
};
const createSearchForm = (categories, tags) => {
    return forms.create({
        'name': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'min_cost': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
          'max_cost': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'category_id': fields.string({
            label: 'Category',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: categories
        }),
        'tags': fields.string({
            required:false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: tags
        }),
    })
};

// Create User Registration Form
const createSignupForm = ()=>{
    return forms.create({
        'username': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label': ['form-label']
            }
        }),
        'email': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label': ['form-label']
            }
        }),
        'password': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label': ['form-label']
            },
            'widget': widgets.password()
        }),
        'confirm_password': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label':['form-label']
            },
            'widget': widgets.password(),
            'validators': [validators.matchField('password')]
        })
    })
}

// create login form
const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label': ['form-label']
            }
        }),
        'password': fields.string({
            'required': true,
            'errorAfterField': true,
            'cssClasses': {
                'label': ['form-label']
            },
            'widget': widgets.password()
        })
    })
}

module.exports = { createProductForm, createSearchForm, createSignupForm, createLoginForm, bootstrapField };

