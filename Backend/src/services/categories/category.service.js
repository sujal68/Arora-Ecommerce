const Category = require('../../model/category.model');

module.exports = class CategoryService {

    async createCategory(body) {
        try {
            return await Category.create(body);
        } catch (error) {
            console.log('Create Category Error', error);
        }
    }

    async FetchSingleCategory(body, isSelect) {
        try {
            if (isSelect) {
                return await Category.findOne(body).select('_id category_name description image isActive createAt updateAt');
            } else {
                return await Category.findOne(body);
            }
        } catch (error) {
            console.log('Fetch Single Category Error', error);
        }
    }

    async FetchAllCategory() {
        try {
            return await Category.find({ isDelete: false }).select('_id category_name description image isActive createAt updateAt');
        } catch (error) {
            console.log('Fetch All Category Error', error);
        }
    }

    async updateCategory(id, body) {
        try {
            return await Category.findByIdAndUpdate(id, body, { new: true }).select('_id category_name description image isActive');
        } catch (error) {
            console.log('Update Category Error', error);
        }
    }

};
