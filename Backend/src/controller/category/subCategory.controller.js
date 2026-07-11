const SubCategoryService = require('../../services/categories/subCategory.service');
const CategoryService = require('../../services/categories/category.service');
const { successResponse, errorResponse } = require('../../utils/response');
const { MSG } = require('../../utils/msg');
const moment = require('moment');
const statusCode = require('http-status-codes');

const subCategoryService = new SubCategoryService();
const categoryService = new CategoryService();

module.exports.createSubCategory = async (req, res) => {
    try {
        const category = await categoryService.FetchSingleCategory({ _id: req.body.category_id, isDelete: false }, false);
        if (!category) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.Category_Not_Found));
        }

        const existing = await subCategoryService.FetchSingleSubCategory({ sub_category_name: req.body.sub_category_name, category_id: req.body.category_id, isDelete: false }, false);
        if (existing) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Already_Exist));
        }

        if (req.file) req.body.image = req.file.path;

        req.body.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const newSubCategory = await subCategoryService.createSubCategory(req.body);
        if (!newSubCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Add_Failed));
        }

        return res.json(successResponse(statusCode.CREATED, false, MSG.SubCategory_Added, newSubCategory));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.fetchSubCategory = async (req, res) => {
    try {
        const query = req.query.category_id ? { category_id: req.query.category_id } : {};
        const subCategories = await subCategoryService.FetchAllSubCategory(query);
        return res.json(successResponse(statusCode.OK, false, MSG.SubCategory_Fetched, subCategories));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.updateSubCategory = async (req, res) => {
    try {
        const subCategory = await subCategoryService.FetchSingleSubCategory({ _id: req.query.id, isDelete: false }, false);
        if (!subCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Not_Found));
        }

        if (req.body.sub_category_name) {
            const duplicate = await subCategoryService.FetchSingleSubCategory({ sub_category_name: req.body.sub_category_name, category_id: subCategory.category_id, isDelete: false }, false);
            if (duplicate && duplicate._id.toString() !== req.query.id) {
                return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Already_Exist));
            }
        }

        if (req.file) req.body.image = req.file.path;
        req.body.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

        const updated = await subCategoryService.updateSubCategory(req.query.id, req.body);
        return res.json(successResponse(statusCode.OK, false, MSG.SubCategory_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.deleteSubCategory = async (req, res) => {
    try {
        const subCategory = await subCategoryService.FetchSingleSubCategory({ _id: req.query.id, isDelete: false }, false);
        if (!subCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Not_Found));
        }

        const deleted = await subCategoryService.updateSubCategory(req.query.id, { isDelete: true, isActive: false });
        return res.json(successResponse(statusCode.OK, false, MSG.SubCategory_Deleted, deleted));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};

module.exports.activeOrInactiveSubCategory = async (req, res) => {
    try {
        const subCategory = await subCategoryService.FetchSingleSubCategory({ _id: req.query.id, isDelete: false }, false);
        if (!subCategory) {
            return res.json(errorResponse(statusCode.BAD_REQUEST, true, MSG.SubCategory_Not_Found));
        }

        const updated = await subCategoryService.updateSubCategory(req.query.id, { isActive: !subCategory.isActive });
        return res.json(successResponse(statusCode.OK, false, MSG.SubCategory_Status_Updated, updated));
    } catch (error) {
        console.log('Something Went Wrong!!', error);
        return res.json(errorResponse(statusCode.INTERNAL_SERVER_ERROR, true, MSG.Something_Went_Wrong));
    }
};
