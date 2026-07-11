const SubCategory = require('../../model/subCategory.model');

module.exports = class SubCategoryService {

    async createSubCategory(body) {
        try {
            return await SubCategory.create(body);
        } catch (error) {
            console.log('Create SubCategory Error', error);
        }
    }

    async FetchSingleSubCategory(body, isSelect) {
        try {
            if (isSelect) {
                return await SubCategory.findOne(body)
                    .select('_id category_id sub_category_name description image isActive createAt updateAt')
                    .populate('category_id', '_id category_name');
            } else {
                return await SubCategory.findOne(body);
            }
        } catch (error) {
            console.log('Fetch Single SubCategory Error', error);
        }
    }

    async FetchAllSubCategory(query = {}) {
        try {
            return await SubCategory.find({ isDelete: false, ...query })
                .select('_id category_id sub_category_name description image isActive createAt updateAt')
                .populate('category_id', '_id category_name');
        } catch (error) {
            console.log('Fetch All SubCategory Error', error);
        }
    }

    async updateSubCategory(id, body) {
        try {
            return await SubCategory.findByIdAndUpdate(id, body, { new: true })
                .select('_id category_id sub_category_name description image isActive');
        } catch (error) {
            console.log('Update SubCategory Error', error);
        }
    }

};
