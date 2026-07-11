const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    product_name: {
        type: String,
        required: true,
    },
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
    extra_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExtraCategory',
        default: null,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        default: 0,
    },
    sku: {
        type: String,
        default: '',
    },
    brand: {
        type: String,
        default: '',
    },
    images: {
        type: [String],
        default: [],
    },
    thumbnail: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        default: 0,
    },
    totalReview: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model('Product', productSchema, 'Product');
