var mongoose = require('mongoose');
mongoose.Types.ObjectId.isValid('your id here');
var schema = new mongoose.Schema(
    {
        id_product: {
            type: String,
            ref: 'Products',
        },
        id_user: {
            type: String,
            ref: 'Users'
        },
        content: String,
        star: Number,
        status: String
    }
);

var Comment = mongoose.model('Comment', schema, 'comment');

module.exports = Comment;