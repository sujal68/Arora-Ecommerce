import { api, handleError } from "../auth/authService";

export const getStoreSetting = async (key: string) => {
    try {
        const res = await api.get("/setting", { params: { key } });
        return res.data;
    } catch (error) {
        return handleError(error, `Failed to load settings for ${key}`);
    }
};

export const saveStoreSetting = async (key: string, value: any) => {
    try {
        const res = await api.post("/setting", { key, value });
        return res.data;
    } catch (error) {
        return handleError(error, `Failed to save settings for ${key}`);
    }
};
