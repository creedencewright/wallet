var mongoose = require('mongoose');

// define the schema for our user model
var typeSchema = mongoose.Schema({
    name: {
        ru: String,
        en: String
    },
    type: String,
    code: String
});

module.exports = mongoose.model('Type', typeSchema);