import axios from "axios";

const BASE = "https://arora-ecommerce.onrender.com/api/auth";
const ADMIN_BASE = `${BASE}/admin`;

// ─── Axios instance with JWT interceptor ──────────────────────────────────────
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, });

const getOrCreateSessionId = () => {
    let sid = sessionStorage.getItem('admin_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('admin_session_id', sid);
    }
    return sid;
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminAuthToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-session-id'] = getOrCreateSessionId();
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("adminAuthToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ─── Helper ───────────────────────────────────────────────────────────────────
export const handleError = (error: any, fallback: string) =>
    error?.response?.data || { status: 500, massage: fallback };

// =============================================================================
// AUTH — Public (no token needed)
// =============================================================================

export const adminLogin = async (data: { email: string; password: string }) => {
    try {
        const res = await axios.post(`${ADMIN_BASE}/loginAdmin`, data);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Unable to login. Please try again.");
    }
};

export const forgotPassword = async (email: string) => {
    try {
        const res = await axios.post(`${ADMIN_BASE}/Forgotpassword`, { email });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to send OTP. Please try again.");
    }
};

export const AdminOtpVerify = async (OTP: string) => {
    try {
        const email = sessionStorage.getItem("resetEmail") || "";
        const res = await axios.post(`${ADMIN_BASE}/VerifyOtp`, { email, OTP: Number(OTP) });
        return res.data;
    } catch (error: any) {
        return handleError(error, "OTP verification failed. Please try again.");
    }
};

export const ResetPassword = async (new_password: string) => {
    try {
        const email = sessionStorage.getItem("resetEmail") || "";
        const res = await axios.post(`${ADMIN_BASE}/NewChangePassword`, { email, new_password });
        return res.data;
    } catch (error: any) {
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

        const admins   = adminsRes.status   === 'fulfilled' ? adminsRes.value.data     : null;
        const users    = usersRes.status    === 'fulfilled' ? usersRes.value.data      : null;
        const products = productsRes.status === 'fulfilled' ? productsRes.value.data   : null;
        const cats     = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : null;
        const subCats  = subCatRes.status   === 'fulfilled' ? subCatRes.value.data     : null;
        const extraCats = extraCatRes.status === 'fulfilled' ? extraCatRes.value.data  : null;

        const adminCount    = Array.isArray(admins?.result)    ? admins.result.length    : 0;
        const userCount     = Array.isArray(users?.result)     ? users.result.length     : 0;
        const productCount  = products?.result?.total          ?? 0;
        const catCount      = Array.isArray(cats?.result)      ? cats.result.length      : 0;
        const subCatCount   = Array.isArray(subCats?.result)   ? subCats.result.length   : 0;
        const extraCatCount = Array.isArray(extraCats?.result) ? extraCats.result.length : 0;
        const totalCats     = catCount + subCatCount + extraCatCount;

        // active users
        const activeUsers = Array.isArray(users?.result)
            ? users.result.filter((u: any) => u.isActive && !u.isDelete).length
            : 0;

        // top products by stock (for top products widget)
        const allProducts: any[] = products?.result?.products ?? [];

        return {
            admins:     adminCount,
            users:      userCount,
            activeUsers,
            products:   productCount,
            categories: totalCats,
            catCount,
            subCatCount,
            extraCatCount,
            topProducts: allProducts.slice(0, 5),
            // orders not in backend yet
            pending:    0,
            earnings:   0,
            revenue:    0,
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
