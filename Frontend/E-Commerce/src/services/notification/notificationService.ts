import { api, handleError } from "../auth/authService";

export const fetchNotifications = async () => {
    try {
        const res = await api.get("/notification");
        return res.data;
    } catch (error) {
        return handleError(error, "Failed to load notifications");
    }
};

export const markNotificationsRead = async (id?: string) => {
    try {
        const params: Record<string, string> = {};
        if (id) params.id = id;
        const res = await api.put("/notification/read", null, { params });
        return res.data;
    } catch (error) {
        return handleError(error, "Failed to update notifications");
    }
};

export const deleteNotifications = async (id?: string) => {
    try {
        const params: Record<string, string> = {};
        if (id) params.id = id;
        const res = await api.delete("/notification", { params });
        return res.data;
    } catch (error) {
        return handleError(error, "Failed to delete notifications");
    }
};
