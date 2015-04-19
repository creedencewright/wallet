var mongoose = require('mongoose');

// define the schema for our user model
var dataSchema = mongoose.Schema({
    time: Number,
    name: String,
    type: String,
    value: Number,
    userId: String
});

module.exports = mongoose.model('Entry', dataSchema);