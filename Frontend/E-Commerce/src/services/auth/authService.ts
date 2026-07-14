import axios from "axios";

// ─── Axios instance with JWT interceptor ──────────────────────────────────────
export const api = axios.create({ baseURL: "https://arora-ecommerce-1.onrender.com/api", });

const ADMIN_BASE = `https://arora-ecommerce-1.onrender.com/api/auth/admin`;

const getOrCreateSessionId = () => {
    let sid = sessionStorage.getItem('admin_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('admin_session_id', sid);
    }
    return sid;
};

api.interceptors.request.use((config) => {
    console.log("[LOG] [AXIOS] Request Interceptor - URL:", config.url, "Method:", config.method);
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
        console.log("[LOG] [AXIOS] Adding Bearer Token to headers");
        config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionId = getOrCreateSessionId();
    console.log("[LOG] [AXIOS] Adding session-id to headers:", sessionId);
    config.headers['x-session-id'] = sessionId;
    return config;
});

api.interceptors.response.use(
    (res) => {
        console.log("[LOG] [AXIOS] Response Interceptor (Success) - URL:", res.config.url, "Status:", res.status);
        return res;
    },
    (error) => {
        console.error("[LOG] [AXIOS] Response Interceptor (Error) - URL:", error?.config?.url, "Status:", error?.response?.status, "Message:", error?.message);
        if (error?.response?.status === 401) {
            console.log("[LOG] [AXIOS] Unauthorized (401). Clearing token and redirecting to login...");
            localStorage.removeItem("adminAuthToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ─── Helper ───────────────────────────────────────────────────────────────────
export const handleError = (error: any, fallback: string) => {
    console.log("[LOG] [FRONTEND] handleError called. Error object:", error);
    const extractedData = error?.response?.data;
    if (extractedData) {
        console.log("[LOG] [FRONTEND] Extracted error data from response:", extractedData);
        return extractedData;
    }
    console.log("[LOG] [FRONTEND] No response data found, returning fallback:", fallback);
    return { status: 500, massage: fallback };
};

// =============================================================================
// AUTH — Public (no token needed)
// =============================================================================

export const adminLogin = async (data: { email: string; password: string }) => {
    try {
        console.log("[LOG] [FRONTEND] adminLogin called with email:", data.email);
        const res = await api.post(`/auth/admin/loginAdmin`, data);
        console.log("[LOG] [FRONTEND] adminLogin post success, response data:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("[LOG] [FRONTEND] adminLogin post failed:", error);
        return handleError(error, "Unable to login. Please try again.");
    }
};

export const forgotPassword = async (email: string) => {
    try {
        console.log("[LOG] [FRONTEND] forgotPassword called with email:", email);
        const res = await api.post(`/auth/admin/Forgotpassword`, { email });
        console.log("[LOG] [FRONTEND] forgotPassword post success, response data:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("[LOG] [FRONTEND] forgotPassword post failed:", error);
        return handleError(error, "Failed to send OTP. Please try again.");
    }
};

export const AdminOtpVerify = async (OTP: string) => {
    try {
        const email = sessionStorage.getItem("resetEmail") || "";
        console.log("[LOG] [FRONTEND] AdminOtpVerify called. Email:", email, "OTP:", OTP);
        const res = await api.post(`/auth/admin/VerifyOtp`, { email, OTP: Number(OTP) });
        console.log("[LOG] [FRONTEND] AdminOtpVerify post success, response data:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("[LOG] [FRONTEND] AdminOtpVerify post failed:", error);
        return handleError(error, "OTP verification failed. Please try again.");
    }
};

export const ResetPassword = async (new_password: string) => {
    try {
        const email = sessionStorage.getItem("resetEmail") || "";
        console.log("[LOG] [FRONTEND] ResetPassword called. Email:", email);
        const res = await api.post(`/auth/admin/NewChangePassword`, { email, new_password });
        console.log("[LOG] [FRONTEND] ResetPassword post success, response data:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("[LOG] [FRONTEND] ResetPassword post failed:", error);
        return handleError(error, "Password reset failed. Please try again.");
    }
};

// =============================================================================
// ADMIN — Protected (JWT required)
// =============================================================================

export const registerAdmin = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
}) => {
    try {
        const res = await api.post(`/auth/admin/registerAdmin`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to register admin.");
    }
};

export const fetchAdmins = async () => {
    try {
        const res = await api.get(`/auth/admin/`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch admins.");
    }
};

export const deleteAdmin = async (id: string) => {
    try {
        const res = await api.delete(`/auth/admin/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete admin.");
    }
};

export const updateAdmin = async (id: string, data: Record<string, any>) => {
    try {
        const res = await api.patch(`/auth/admin/?id=${id}`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update admin.");
    }
};

export const toggleAdminActive = async (id: string) => {
    try {
        const res = await api.put(`/auth/admin/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to toggle admin status.");
    }
};

export const getAdminProfile = async () => {
    try {
        const res = await api.get(`/auth/admin/profile`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch profile.");
    }
};

export const changeAdminPassword = async (data: {
    current_password: string;
    new_password: string;
}) => {
    try {
        const res = await api.post(`/auth/admin/changePassword`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to change password.");
    }
};

// =============================================================================
// USER — Protected (JWT required)
// =============================================================================

export const registerUser = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    gender: string;
    address?: string;
}) => {
    try {
        const res = await api.post(`/auth/user/registerUser`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to register user.");
    }
};

export const fetchUsers = async () => {
    try {
        const res = await api.get(`/auth/user/`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch users.");
    }
};

export const deleteUser = async (id: string) => {
    try {
        const res = await api.delete(`/auth/user/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete user.");
    }
};

export const updateUser = async (id: string, data: Record<string, any>) => {
    try {
        const res = await api.patch(`/auth/user/?id=${id}`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update user.");
    }
};

export const toggleUserActive = async (id: string) => {
    try {
        const res = await api.put(`/auth/user/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to toggle user status.");
    }
};

// =============================================================================
// DASHBOARD — Stats (parallel fetch)
// =============================================================================

export const fetchDashboardStats = async () => {
    try {
        const [adminsRes, usersRes, productsRes, categoriesRes, subCatRes, extraCatRes] =
            await Promise.allSettled([
                api.get(`/auth/admin/`),
                api.get(`/auth/user/`),
                api.get(`/product/?limit=1`),
                api.get(`/category/`),
                api.get(`/sub-category/`),
                api.get(`/extra-category/`),
            ]);

        const admins = adminsRes.status === 'fulfilled' ? adminsRes.value.data : null;
        const users = usersRes.status === 'fulfilled' ? usersRes.value.data : null;
        const products = productsRes.status === 'fulfilled' ? productsRes.value.data : null;
        const cats = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : null;
        const subCats = subCatRes.status === 'fulfilled' ? subCatRes.value.data : null;
        const extraCats = extraCatRes.status === 'fulfilled' ? extraCatRes.value.data : null;

        const adminCount = Array.isArray(admins?.result) ? admins.result.length : 0;
        const userCount = Array.isArray(users?.result) ? users.result.length : 0;
        const productCount = products?.result?.total ?? 0;
        const catCount = Array.isArray(cats?.result) ? cats.result.length : 0;
        const subCatCount = Array.isArray(subCats?.result) ? subCats.result.length : 0;
        const extraCatCount = Array.isArray(extraCats?.result) ? extraCats.result.length : 0;
        const totalCats = catCount + subCatCount + extraCatCount;

        // active users
        const activeUsers = Array.isArray(users?.result)
            ? users.result.filter((u: any) => u.isActive && !u.isDelete).length
            : 0;

        // top products by stock (for top products widget)
        const allProducts: any[] = products?.result?.products ?? [];

        return {
            admins: adminCount,
            users: userCount,
            activeUsers,
            products: productCount,
            categories: totalCats,
            catCount,
            subCatCount,
            extraCatCount,
            topProducts: allProducts.slice(0, 5),
            // orders not in backend yet
            pending: 0,
            earnings: 0,
            revenue: 0,
        };
    } catch (error: any) {
        return null;
    }
};

export const fetchTopProducts = async () => {
    try {
        const res = await api.get(`/product/?limit=5&sort=newest`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch products.");
    }
};
