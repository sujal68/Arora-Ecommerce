const express = require('express');
const { createProduct, fetchAllProducts, fetchSingleProduct, updateProduct, deleteProduct, activeOrInactiveProduct } = require('../../controller/product/product.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { uploadMultiple } = require('../../middleware/storage.middleware');

const productRouter = express.Router();

productRouter.post('/', authMiddleware, uploadMultiple('Products', 5), createProduct);
productRouter.get('/', authMiddleware, fetchAllProducts);
productRouter.get('/single', authMiddleware, fetchSingleProduct);
productRouter.put('/', authMiddleware, uploadMultiple('Products', 5), updateProduct);
productRouter.delete('/', authMiddleware, deleteProduct);
productRouter.patch('/status', authMiddleware, activeOrInactiveProduct);

module.exports = productRouter;
