const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// for sessions and flash messages
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// custom middleware goes here
app.use(function(req,res,next){
  //locals is the directionary you pass to the hbs file
  res.locals.date = new Date();
  next()
})

// set up sessions
app.use(session({
  store: new FileStore(),
  secret: 'waPjjt7ZJyHN1uQsJJEWdjNifWpGnzFu', // randomkeygen
  resave: false,
  saveUninitialized: true
}))

// Set up flash messages
app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// every time: nodemon --ignore sessions

// Require our own custom routers
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/user')
const cloudinaryRoutes = require('./routes/cloudinary')

async function main() {
  app.use('/', landingRoutes)
  app.use('/products', productRoutes)
  app.use('/user', userRoutes)
  app.use('/cloudinary', cloudinaryRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});