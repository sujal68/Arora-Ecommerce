import { api, handleError } from "../auth/authService";

export const fetchAllOrders = async () => {
    try {
        const res = await api.get("/order/");
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch orders.");
    }
};

export const fetchSingleOrder = async (id: string) => {
    try {
        const res = await api.get(`/order/single?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch order details.");
    }
};

export const updateOrderStatus = async (id: string, updateData: { status?: string; payment?: string; trackingId?: string }) => {
    try {
        const res = await api.put(`/order/?id=${id}`, updateData);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update order status.");
    }
};

export const cancelOrder = async (id: string) => {
    try {
        const res = await api.patch(`/order/cancel?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to cancel order.");
    }
};
