// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    id: {
        type: String,
        getter: function(val) { return this._id.toString(); },
        unique: true
    },
    balance: Number,
    savings: Number,
    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

userSchema.pre('save', function(next) {
    this.id = this._id;
    next();
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);