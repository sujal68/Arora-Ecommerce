const express = require('express');
const { createExtraCategory, fetchExtraCategory, updateExtraCategory, deleteExtraCategory, activeOrInactiveExtraCategory } = require('../../controller/category/extraCategory.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { uploadSingle } = require('../../middleware/storage.middleware');

const extraCategoryRouter = express.Router();

extraCategoryRouter.post('/', authMiddleware, uploadSingle('ExtraCategories'), createExtraCategory);
extraCategoryRouter.get('/', authMiddleware, fetchExtraCategory);
extraCategoryRouter.put('/', authMiddleware, uploadSingle('ExtraCategories'), updateExtraCategory);
extraCategoryRouter.delete('/', authMiddleware, deleteExtraCategory);
extraCategoryRouter.patch('/status', authMiddleware, activeOrInactiveExtraCategory);

module.exports = extraCategoryRouter;
