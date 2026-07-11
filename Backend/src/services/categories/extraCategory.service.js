const ExtraCategory = require('../../model/extraCategory.model');

module.exports = class ExtraCategoryService {

    async createExtraCategory(body) {
        try {
            return await ExtraCategory.create(body);
        } catch (error) {
            console.log('Create ExtraCategory Error', error);
        }
    }

    async FetchSingleExtraCategory(body, isSelect) {
        try {
            if (isSelect) {
                return await ExtraCategory.findOne(body)
                    .select('_id category_id sub_category_id extra_category_name description image isActive createAt updateAt')
                    .populate('category_id', '_id category_name')
                    .populate('sub_category_id', '_id sub_category_name');
            } else {
                return await ExtraCategory.findOne(body);
            }
        } catch (error) {
            console.log('Fetch Single ExtraCategory Error', error);
        }
    }

    async FetchAllExtraCategory(query = {}) {
        try {
            return await ExtraCategory.find({ isDelete: false, ...query })
                .select('_id category_id sub_category_id extra_category_name description image isActive createAt updateAt')
                .populate('category_id', '_id category_name')
                .populate('sub_category_id', '_id sub_category_name');
        } catch (error) {
            console.log('Fetch All ExtraCategory Error', error);
        }
    }

    async updateExtraCategory(id, body) {
        try {
            return await ExtraCategory.findByIdAndUpdate(id, body, { new: true })
                .select('_id category_id sub_category_id extra_category_name description image isActive');
        } catch (error) {
            console.log('Update ExtraCategory Error', error);
        }
    }

};
