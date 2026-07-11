import { api, handleError } from "../auth/authService";

export const fetchAnalyticsStats = async (range?: string, startDate?: string, endDate?: string) => {
    try {
        const params: Record<string, string> = {};
        if (range) params.range = range;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const res = await api.get("/dashboard/stats", { params });
        return res.data;
    } catch (error) {
        return handleError(error, "Failed to load dashboard metrics");
    }
};

export const fetchRevenueCharts = async (view: string) => {
    try {
        const res = await api.get("/dashboard/charts", { params: { view } });
        return res.data;
    } catch (error) {
        return handleError(error, "Failed to load revenue charts");
    }
};

export const exportReport = async (type: string, format: string) => {
    try {
        const res = await api.get("/dashboard/export", {
            params: { type, format },
            responseType: 'blob'
        });
        
        // Create browser download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        return { status: 200, massage: "Export completed" };
    } catch (error) {
        return handleError(error, "Failed to export report");
    }
};
