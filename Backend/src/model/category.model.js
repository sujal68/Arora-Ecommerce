const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    createAt: {
        type: String,
        required: true,
    },
    updateAt: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Category', categorySchema, 'Category');
