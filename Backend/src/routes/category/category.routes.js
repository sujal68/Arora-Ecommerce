const express = require('express');
const { createCategory, fetchCategory, updateCategory, deleteCategory, activeOrInactiveCategory } = require('../../controller/category/category.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const categoryRouter = express.Router();

const { uploadSingle } = require('../../middleware/storage.middleware');

categoryRouter.post('/', authMiddleware, uploadSingle('Categories'), createCategory);
categoryRouter.get('/', authMiddleware, fetchCategory);
categoryRouter.put('/', authMiddleware, uploadSingle('Categories'), updateCategory);
categoryRouter.delete('/', authMiddleware, deleteCategory);
categoryRouter.patch('/status', authMiddleware, activeOrInactiveCategory);

module.exports = categoryRouter;
