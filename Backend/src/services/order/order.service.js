const Order = require('../../model/order.model');

module.exports = class OrderService {

    async createOrder(body) {
        try {
            return await Order.create(body);
        } catch (error) {
            console.log('Create Order Error', error);
            throw error;
        }
    }

    async fetchSingleOrder(body) {
        try {
            return await Order.findOne(body).populate('user_id', '_id first_name last_name email phone');
        } catch (error) {
            console.log('Fetch Single Order Error', error);
            throw error;
        }
    }

    async fetchAllOrders(filter = {}) {
        try {
            return await Order.find(filter)
                .populate('user_id', '_id first_name last_name email phone')
                .sort({ createAt: -1 });
        } catch (error) {
            console.log('Fetch All Orders Error', error);
            throw error;
        }
    }

    async updateOrder(id, body) {
        try {
            return await Order.findByIdAndUpdate(id, body, { new: true }).populate('user_id', '_id first_name last_name email phone');
        } catch (error) {
            console.log('Update Order Error', error);
            throw error;
        }
    }

};
