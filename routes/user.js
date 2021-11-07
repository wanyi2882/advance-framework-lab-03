const express = require('express');
const { createSignupForm, bootstrapField } = require('../forms');
const { User } = require('../models');
const router = express.Router();


router.get('/register', (req,res)=>{
    const signUpForm = createSignupForm();
    res.render('users/register',{
        signUpForm: signUpForm.toHTML(bootstrapField)
    })
});


module.exports = router;