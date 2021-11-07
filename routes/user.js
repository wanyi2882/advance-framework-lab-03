const express = require('express');
const { createSignupForm, createLoginForm, bootstrapField } = require('../forms');
const { User } = require('../models');
const router = express.Router();

router.get('/register', async (req,res)=>{
    const signUpForm = createSignupForm();
    res.render('users/register',{
        signUpForm: signUpForm.toHTML(bootstrapField)
    })
});

router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        loginForm: loginForm.toHTML(bootstrapField)
    })
})


module.exports = router;