import { api, handleError } from "../auth/authService";

// =============================================================================
// CATEGORIES
// =============================================================================

export const fetchCategories = async () => {
    try {
        const res = await api.get("/category/");
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch categories.");
    }
};

export const createCategory = async (formData: FormData) => {
    try {
        const res = await api.post("/category/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to create category.");
    }
};

export const updateCategory = async (id: string, formData: FormData) => {
    try {
        const res = await api.put(`/category/?id=${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update category.");
    }
};

export const deleteCategory = async (id: string) => {
    try {
        const res = await api.delete(`/category/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete category.");
    }
};

export const toggleCategoryActive = async (id: string) => {
    try {
        const res = await api.patch(`/category/status?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update category status.");
    }
};

// =============================================================================
// SUB CATEGORIES
// =============================================================================

export const fetchSubCategories = async () => {
    try {
        const res = await api.get("/sub-category/");
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch sub-categories.");
    }
};

export const createSubCategory = async (formData: FormData) => {
    try {
        const res = await api.post("/sub-category/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to create sub-category.");
    }
};

export const updateSubCategory = async (id: string, formData: FormData) => {
    try {
        const res = await api.put(`/sub-category/?id=${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update sub-category.");
    }
};

export const deleteSubCategory = async (id: string) => {
    try {
        const res = await api.delete(`/sub-category/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete sub-category.");
    }
};

export const toggleSubCategoryActive = async (id: string) => {
    try {
        const res = await api.patch(`/sub-category/status?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update sub-category status.");
    }
};

// =============================================================================
// EXTRA CATEGORIES
// =============================================================================

export const fetchExtraCategories = async () => {
    try {
        const res = await api.get("/extra-category/");
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch extra categories.");
    }
};

export const createExtraCategory = async (formData: FormData) => {
    try {
        const res = await api.post("/extra-category/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to create extra category.");
    }
};

export const updateExtraCategory = async (id: string, formData: FormData) => {
    try {
        const res = await api.put(`/extra-category/?id=${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update extra category.");
    }
};

export const deleteExtraCategory = async (id: string) => {
    try {
        const res = await api.delete(`/extra-category/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete extra category.");
    }
};

export const toggleExtraCategoryActive = async (id: string) => {
    try {
        const res = await api.patch(`/extra-category/status?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update extra category status.");
    }
};

// =============================================================================
// PRODUCTS
// =============================================================================

export interface FetchProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    category_id?: string;
    sub_category_id?: string;
    extra_category_id?: string;
}

export const fetchProducts = async (params?: FetchProductsParams) => {
    try {
        const res = await api.get("/product/", { params });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch products.");
    }
};

export const fetchSingleProduct = async (id: string) => {
    try {
        const res = await api.get(`/product/single?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to fetch product details.");
    }
};

export const createProduct = async (formData: FormData) => {
    try {
        const res = await api.post("/product/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to create product.");
    }
};

export const updateProduct = async (id: string, formData: FormData) => {
    try {
        const res = await api.put(`/product/?id=${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to update product.");
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const res = await api.delete(`/product/?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to delete product.");
    }
};

export const toggleProductActive = async (id: string) => {
    try {
        const res = await api.patch(`/product/status?id=${id}`);
        return res.data;
    } catch (error: any) {
        return handleError(error, "Failed to toggle product status.");
    }
};
