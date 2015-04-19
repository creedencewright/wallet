var mongoose = require('mongoose');
mongoose.connect('localhost:27017/wallet');

module.exports = mongoose.connection;