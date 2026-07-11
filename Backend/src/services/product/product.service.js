const Product = require('../../model/product.model');

const populateRefs = [
    { path: 'category_id', select: '_id category_name' },
    { path: 'sub_category_id', select: '_id sub_category_name' },
    { path: 'extra_category_id', select: '_id extra_category_name' },
];

module.exports = class ProductService {

    async createProduct(body) {
        try {
            return await Product.create(body);
        } catch (error) {
            console.log('Create Product Error', error);
        }
    }

    async FetchSingleProduct(body, isSelect) {
        try {
            if (isSelect) {
                return await Product.findOne(body)
                    .select('_id product_name category_id sub_category_id extra_category_id description price discount stock sku brand images thumbnail rating totalReview isFeatured isActive createAt updateAt')
                    .populate(populateRefs);
            } else {
                return await Product.findOne(body);
            }
        } catch (error) {
            console.log('Fetch Single Product Error', error);
        }
    }

    async FetchAllProducts({ filter, search, sort, page, limit }) {
        try {
            const query = { isDelete: false, ...filter };

            if (search) {
                query.$or = [
                    { product_name: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } },
                ];
            }

            const sortOption = sort === 'price_asc'
                ? { price: 1 }
                : sort === 'price_desc'
                    ? { price: -1 }
                    : sort === 'oldest'
                        ? { createAt: 1 }
                        : { createAt: -1 };

            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const [products, total] = await Promise.all([
                Product.find(query)
                    .select('_id product_name category_id sub_category_id extra_category_id price discount stock brand images thumbnail rating totalReview isFeatured isActive createAt updateAt')
                    .populate(populateRefs)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limitNum),
                Product.countDocuments(query),
            ]);

            return { products, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
        } catch (error) {
            console.log('Fetch All Products Error', error);
        }
    }

    async updateProduct(id, body) {
        try {
            return await Product.findByIdAndUpdate(id, body, { new: true })
                .select('_id product_name category_id sub_category_id extra_category_id price discount stock brand images thumbnail isFeatured isActive');
        } catch (error) {
            console.log('Update Product Error', error);
        }
    }

};
