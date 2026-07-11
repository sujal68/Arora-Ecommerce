const express = require('express');
const { createSubCategory, fetchSubCategory, updateSubCategory, deleteSubCategory, activeOrInactiveSubCategory } = require('../../controller/category/subCategory.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { uploadSingle } = require('../../middleware/storage.middleware');

const subCategoryRouter = express.Router();

subCategoryRouter.post('/', authMiddleware, uploadSingle('SubCategories'), createSubCategory);
subCategoryRouter.get('/', authMiddleware, fetchSubCategory);
subCategoryRouter.put('/', authMiddleware, uploadSingle('SubCategories'), updateSubCategory);
subCategoryRouter.delete('/', authMiddleware, deleteSubCategory);
subCategoryRouter.patch('/status', authMiddleware, activeOrInactiveSubCategory);

module.exports = subCategoryRouter;
