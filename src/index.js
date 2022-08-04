const express = require('express');
var bodyParser = require('body-parser');
const multer = require("multer");

const route = require('./routes/route.js');

const app = express();

app.use(multer().any())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://Ritikesh21:Gyanav_123@cluster0.fg4arro.mongodb.net/Infoware", {useNewUrlParser: true})
    .then(() => console.log('mongodb running on 27017'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});