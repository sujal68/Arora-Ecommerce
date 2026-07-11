const ProductService = require('../../services/product/product.service');
const CategoryService = require('../../services/categories/category.service');
const SubCategoryService = require('../../services/categories/subCategory.service');
const ExtraCategoryService = require('../../services/categories/extraCategory.service');
const { successResponse, errorResponse } = require('../../utils/response');
const { MSG } = require('../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');

const productService = new ProductService();
const categoryService = new CategoryService();
const subCategoryService = new SubCategoryService();
const extraCategoryService = new ExtraCategoryService();

module.exports.createProduct = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.body.category_id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        const subCategory = await subCategoryService.FetchSingleSubCategory({ _id: req.body.sub_category_id, isDelete: false }, false);
        if (!subCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Not_Found));
        }

        if (req.body.extra_category_id) {
            const extraCategory = await extraCategoryService.FetchSingleExtraCategory({ _id: req.body.extra_category_id, isDelete: false }, false);
            if (!extraCategory) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Not_Found));
            }
        }

        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map((f) => f.path);
            req.body.thumbnail = req.body.images[0];
        }

        req.body.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const newProduct = await productService.createProduct(req.body);
        if (!newProduct) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Product_Add_Failed));
        }

        return res.json(successResponse(statusCode.CREATED, false, MSG.Product_Added, newProduct));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchAllProducts = async (req, res) => {
    try {
        const { search, sort, page, limit, category_id, sub_category_id, extra_category_id, isActive, min_price, max_price } = req.query;

        const filter = {};
        if (category_id) filter.category_id = category_id;
        if (sub_category_id) filter.sub_category_id = sub_category_id;
        if (extra_category_id) filter.extra_category_id = extra_category_id;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (min_price || max_price) {
            filter.price = {};
            if (min_price) filter.price.$gte = Number(min_price);
            if (max_price) filter.price.$lte = Number(max_price);
        }

        const result = await productService.FetchAllProducts({ filter, search, sort, page, limit });
        return res.json(successResponse(statusCode.OK, false, MSG.Products_Fetched, result));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchSingleProduct = async (req, res) => {
    try {
        const product = await productService.FetchSingleProduct({ _id: req.query.id, isDelete: false }, true);
        if (!product) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Product_Not_Found));
        }

        return res.json(successResponse(statusCode.OK, false, MSG.Products_Fetched, product));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.FetchSingleProduct({ _id: req.query.id, isDelete: false }, false);
        if (!product) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Product_Not_Found));
        }

        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map((f) => f.path);
            req.body.thumbnail = req.body.images[0];
        }

        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const updated = await productService.updateProduct(req.query.id, req.body);
        return res.json(successResponse(statusCode.OK, false, MSG.Product_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.deleteProduct = async (req, res) => {
    try {
        const product = await productService.FetchSingleProduct({ _id: req.query.id, isDelete: false }, false);
        if (!product) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Product_Not_Found));
        }

        const deleted = await productService.updateProduct(req.query.id, { isDelete: true, isActive: false });
        return res.json(successResponse(statusCode.OK, false, MSG.Product_Deleted, deleted));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.activeOrInactiveProduct = async (req, res) => {
    try {
        const product = await productService.FetchSingleProduct({ _id: req.query.id, isDelete: false }, false);
        if (!product) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Product_Not_Found));
        }

        const updated = await productService.updateProduct(req.query.id, { isActive: !product.isActive });
        return res.json(successResponse(statusCode.OK, false, MSG.Product_Status_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};
