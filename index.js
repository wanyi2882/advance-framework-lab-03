const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

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

// Require our own custom routers
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products')

async function main() {
  app.use('/', landingRoutes)
  app.use('/products', productRoutes)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});