const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            default: ''
        },
        qty: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            default: ''
        }
    }],
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    payment: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    method: {
        type: String,
        required: true,
        default: 'COD'
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    trackingId: {
        type: String,
        default: ''
    },
    createAt: {
        type: String,
        required: true
    },
    updateAt: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Order", orderSchema, "Order");
