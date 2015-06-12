module.exports = function(mongoose) {
    // define the schema for our user model
    var dataSchema = mongoose.Schema({
        id: {
            type: String,
            getter: function(val) { return this._id.toString(); },
            unique: true
        },
        time: Number,
        category: {},
        name: String,
        type: String,
        value: Number,
        userId: String
    });

    dataSchema.pre('save', function(next) {
        this.id = this._id;
        next();
    });

    return mongoose.model('Item', dataSchema);
}