var mongoose = require('mongoose');

// define the schema for our user model
var typeSchema = mongoose.Schema({
    name: String,
    type: String,
    img: String
});

module.exports = mongoose.model('Type', typeSchema);