const OrderService = require('../../services/order/order.service');
const ProductService = require('../../services/product/product.service');
const UserService = require('../../services/auth/user/user.service');
const { successResponse, errorResponse } = require('../../utils/response');
const { triggerNotification } = require('../notification/notification.controller');
const { MSG } = require('../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');

const orderService = new OrderService();
const productService = new ProductService();
const userService = new UserService();

module.exports.createOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.json(errorResponse(statusCode.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        const { items, method, address, city, notes } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Items array is required"));
        }

        let calculatedTotal = 0;
        const verifiedItems = [];

        // Verify items and check stock
        for (const item of items) {
            const product = await productService.FetchSingleProduct({ _id: item.product_id, isDelete: false }, false);
            if (!product) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, `Product not found: ${item.product_id}`));
            }

            if (!product.isActive) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, `Product is inactive: ${product.product_name}`));
            }

            if (product.stock < item.qty) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, `Insufficient stock for product: ${product.product_name}`));
            }

            const itemPrice = product.price;
            calculatedTotal += itemPrice * item.qty;

            verifiedItems.push({
                product_id: product._id,
                name: product.product_name,
                sku: product.sku || '',
                qty: item.qty,
                price: itemPrice,
                category: product.category_id ? product.category_id.toString() : ''
            });
        }

        // Apply shipping cost (e.g. 100 for orders under 1000)
        const shipping = calculatedTotal >= 1000 ? 0 : 100;
        const finalTotal = calculatedTotal + shipping;

        // Create Order Body
        const orderData = {
            user_id: req.user.id,
            items: verifiedItems,
            status: 'Pending',
            payment: method === 'COD' ? 'Pending' : 'Paid',
            method: method || 'COD',
            address,
            city,
            total: finalTotal,
            shipping,
            notes: notes || '',
            createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updateAt: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        const newOrder = await orderService.createOrder(orderData);
        if (!newOrder) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Order_Failed));
        }

        // Deduct product stock and check for low stock warnings
        for (const item of items) {
            const product = await productService.FetchSingleProduct({ _id: item.product_id }, false);
            if (product) {
                const remainingStock = product.stock - item.qty;
                await productService.updateProduct(product._id, { stock: remainingStock });
                if (remainingStock < 10) {
                    await triggerNotification(`Low stock warning: ${product.product_name} has only ${remainingStock} units left.`, 'warn');
                }
            }
        }

        // Clear user's cart in DB
        await userService.updateUser(req.user.id, { cart: [] });

        // Trigger order placement notification
        await triggerNotification(`New order received: ID ${newOrder._id.toString().slice(-8).toUpperCase()} for ₹${finalTotal.toLocaleString()}`, 'order');

        return res.json(successResponse(statusCode.CREATED, false, MSG.Order_Placed, newOrder));
    } catch (error) {
        console.log('Create Order Error', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchAllOrders = async (req, res) => {
    try {
        let filter = {};
        // If logged in as user, only fetch user's own orders. Admins can fetch all.
        if (req.user && !req.admin) {
            filter.user_id = req.user.id;
        }

        const orders = await orderService.fetchAllOrders(filter);
        return res.json(successResponse(statusCode.OK, false, MSG.Orders_Fetched, orders));
    } catch (error) {
        console.log('Fetch All Orders Error', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchSingleOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        if (!orderId) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Order ID query parameter is required"));
        }

        const order = await orderService.fetchSingleOrder({ _id: orderId });
        if (!order) {
            return res.json(errorResponse(statusCode.NOT_FOUND, true, MSG.Order_Not_Found));
        }

        // If user is fetching, make sure they own the order
        if (req.user && !req.admin && order.user_id._id.toString() !== req.user.id) {
            return res.json(errorResponse(statusCode.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        return res.json(successResponse(statusCode.OK, false, MSG.Orders_Fetched, order));
    } catch (error) {
        console.log('Fetch Single Order Error', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.updateOrderStatus = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json(errorResponse(statusCode.UNAUTHORIZED, true, MSG.Unauthorized_Access));
        }

        const orderId = req.query.id;
        if (!orderId) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Order ID query parameter is required"));
        }

        const order = await orderService.fetchSingleOrder({ _id: orderId });
        if (!order) {
            return res.json(errorResponse(statusCode.NOT_FOUND, true, MSG.Order_Not_Found));
        }

        const { status, payment, trackingId } = req.body;
        const updateFields = { updateAt: moment().format('YYYY-MM-DD HH:mm:ss') };

        if (status) updateFields.status = status;
        if (payment) updateFields.payment = payment;
        if (trackingId !== undefined) updateFields.trackingId = trackingId;

        // If status changes to Cancelled, restore stock
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (const item of order.items) {
                const product = await productService.FetchSingleProduct({ _id: item.product_id }, false);
                if (product) {
                    await productService.updateProduct(product._id, { stock: product.stock + item.qty });
                }
            }
        }

        const updatedOrder = await orderService.updateOrder(orderId, updateFields);
        return res.json(successResponse(statusCode.OK, false, MSG.Order_Status_Updated, updatedOrder));
    } catch (error) {
        console.log('Update Order Status Error', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        if (!orderId) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Order ID query parameter is required"));
        }

        const order = await orderService.fetchSingleOrder({ _id: orderId });
        if (!order) {
            return res.json(errorResponse(statusCode.NOT_FOUND, true, MSG.Order_Not_Found));
        }

        // If user is cancelling, make sure they own it and it is still Pending
        if (req.user && !req.admin) {
            if (order.user_id._id.toString() !== req.user.id) {
                return res.json(errorResponse(statusCode.UNAUTHORIZED, true, MSG.Unauthorized_Access));
            }
            if (order.status !== 'Pending') {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Only pending orders can be cancelled."));
            }
        }

        if (order.status === 'Cancelled') {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, "Order is already cancelled."));
        }

        // Restore stock
        for (const item of order.items) {
            const product = await productService.FetchSingleProduct({ _id: item.product_id }, false);
            if (product) {
                await productService.updateProduct(product._id, { stock: product.stock + item.qty });
            }
        }

        const updatedOrder = await orderService.updateOrder(orderId, {
            status: 'Cancelled',
            updateAt: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        return res.json(successResponse(statusCode.OK, false, MSG.Order_Cancelled, updatedOrder));
    } catch (error) {
        console.log('Cancel Order Error', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};
