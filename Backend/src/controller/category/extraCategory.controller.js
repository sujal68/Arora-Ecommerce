const ExtraCategoryService = require('../../services/categories/extraCategory.service');
const CategoryService = require('../../services/categories/category.service');
const SubCategoryService = require('../../services/categories/subCategory.service');
const { successResponse, errorResponse } = require('../../utils/response');
const { MSG } = require('../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');

const extraCategoryService = new ExtraCategoryService();
const categoryService = new CategoryService();
const subCategoryService = new SubCategoryService();

module.exports.createExtraCategory = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.body.category_id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        const subCategory = await subCategoryService.FetchSingleSubCategory({ _id: req.body.sub_category_id, category_id: req.body.category_id, isDelete: false }, false);
        if (!subCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Not_Found));
        }

        const existing = await extraCategoryService.FetchSingleExtraCategory({ extra_category_name: req.body.extra_category_name, sub_category_id: req.body.sub_category_id, isDelete: false }, false);
        if (existing) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Already_Exist));
        }

        if (req.file) req.body.image = req.file.path;

        req.body.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const newExtraCategory = await extraCategoryService.createExtraCategory(req.body);
        if (!newExtraCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Add_Failed));
        }

        return res.json(successResponse(statusCode.CREATED, false, MSG.ExtraCategory_Added, newExtraCategory));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchExtraCategory = async (req, res) => {
    try {
        const query = {};
        if (req.query.category_id) query.category_id = req.query.category_id;
        if (req.query.sub_category_id) query.sub_category_id = req.query.sub_category_id;

        const extraCategories = await extraCategoryService.FetchAllExtraCategory(query);
        return res.json(successResponse(statusCode.OK, false, MSG.ExtraCategory_Fetched, extraCategories));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.updateExtraCategory = async (req, res) => {
    try {
        const extraCategory = await extraCategoryService.FetchSingleExtraCategory({ _id: req.query.id, isDelete: false }, false);
        if (!extraCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Not_Found));
        }

        if (req.body.extra_category_name) {
            const duplicate = await extraCategoryService.FetchSingleExtraCategory({ extra_category_name: req.body.extra_category_name, sub_category_id: extraCategory.sub_category_id, isDelete: false }, false);
            if (duplicate && duplicate._id.toString() !== req.query.id) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Already_Exist));
            }
        }

        if (req.file) req.body.image = req.file.path;
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const updated = await extraCategoryService.updateExtraCategory(req.query.id, req.body);
        return res.json(successResponse(statusCode.OK, false, MSG.ExtraCategory_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.deleteExtraCategory = async (req, res) => {
    try {
        const extraCategory = await extraCategoryService.FetchSingleExtraCategory({ _id: req.query.id, isDelete: false }, false);
        if (!extraCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Not_Found));
        }

        const deleted = await extraCategoryService.updateExtraCategory(req.query.id, { isDelete: true, isActive: false });
        return res.json(successResponse(statusCode.OK, false, MSG.ExtraCategory_Deleted, deleted));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.activeOrInactiveExtraCategory = async (req, res) => {
    try {
        const extraCategory = await extraCategoryService.FetchSingleExtraCategory({ _id: req.query.id, isDelete: false }, false);
        if (!extraCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.ExtraCategory_Not_Found));
        }

        const updated = await extraCategoryService.updateExtraCategory(req.query.id, { isActive: !extraCategory.isActive });
        return res.json(successResponse(statusCode.OK, false, MSG.ExtraCategory_Status_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};
