const CategoryService = require('../../services/categories/category.service');
const { successResponse, errorResponse } = require('../../utils/response');
const { MSG } = require('../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');

const categoryService = new CategoryService();

module.exports.createCategory = async (req, res) => {
    try {
        const existing = await categoryService.FetchSingleCategory({ category_name: req.body.category_name, isDelete: false }, false);
        if (existing) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Already_Exist));
        }

        if (req.file) req.body.image = req.file.path;

        req.body.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const newCategory = await categoryService.createCategory(req.body);
        if (!newCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Add_Failed));
        }

        return res.json(successResponse(statusCode.CREATED, false, MSG.Category_Added, newCategory));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchCategory = async (req, res) => {
    try {
        const categories = await categoryService.FetchAllCategory();
        return res.json(successResponse(statusCode.OK, false, MSG.Category_Fetched, categories));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.updateCategory = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.query.id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        if (req.body.category_name) {
            const duplicate = await categoryService.FetchSingleCategory({ category_name: req.body.category_name, isDelete: false }, false);
            if (duplicate && duplicate._id.toString() !== req.query.id) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Already_Exist));
            }
        }

        if (req.file) req.body.image = req.file.path;
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const updated = await categoryService.updateCategory(req.query.id, req.body);
        return res.json(successResponse(statusCode.OK, false, MSG.Category_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.deleteCategory = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.query.id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        const deleted = await categoryService.updateCategory(req.query.id, { isDelete: true, isActive: false });
        return res.json(successResponse(statusCode.OK, false, MSG.Category_Deleted, deleted));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.activeOrInactiveCategory = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.query.id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        const updated = await categoryService.updateCategory(req.query.id, { isActive: !category.isActive });
        return res.json(successResponse(statusCode.OK, false, MSG.Category_Status_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};
