const express = require('express');
const { createOrder, fetchAllOrders, fetchSingleOrder, updateOrderStatus, cancelOrder } = require('../../controller/order/order.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const orderRouter = express.Router();

orderRouter.post('/', authMiddleware, createOrder);
orderRouter.get('/', authMiddleware, fetchAllOrders);
orderRouter.get('/single', authMiddleware, fetchSingleOrder);
orderRouter.put('/', authMiddleware, updateOrderStatus);
orderRouter.patch('/cancel', authMiddleware, cancelOrder);

module.exports = orderRouter;
