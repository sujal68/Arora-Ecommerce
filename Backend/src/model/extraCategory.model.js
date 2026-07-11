const mongoose = require('mongoose');

const extraCategorySchema = mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    sub_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
    },
    extra_category_name: {
        type: String,
        required: true,
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

module.exports = mongoose.model('ExtraCategory', extraCategorySchema, 'ExtraCategory');
