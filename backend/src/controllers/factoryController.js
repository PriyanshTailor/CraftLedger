import { sendSuccess, sendError } from '../utils/response.js';

// Factory function for standard CRUD controllers
export const createController = (Model, ModelName) => {
  return {
    create: async (req, res, next) => {
      try {
        const doc = await Model.create({
          ...req.body,
          businessId: req.user.businessId
        });
        return sendSuccess(res, 201, `${ModelName} created successfully`, doc);
      } catch (error) {
        // Handle duplicate key errors (like unique SKU, account code)
        if (error.code === 11000) {
          return sendError(res, 400, `Duplicate value for unique field in ${ModelName}`);
        }
        next(error);
      }
    },

    getAll: async (req, res, next) => {
      try {
        const { search, sort, page = 1, limit = 10, ...filters } = req.query;
        
        // Base query scoped to business
        const query = { businessId: req.user.businessId, isActive: true, ...filters };

        // Search logic (name or code/sku if applicable)
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { accountCode: { $regex: search, $options: 'i' } }
          ].filter(q => Object.keys(Model.schema.paths).includes(Object.keys(q)[0]));
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const docs = await Model.find(query)
          .sort(sort || '-createdAt')
          .skip(skip)
          .limit(parseInt(limit));
        
        const total = await Model.countDocuments(query);

        return sendSuccess(res, 200, `${ModelName}s retrieved successfully`, {
          docs,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        });
      } catch (error) {
        next(error);
      }
    },

    getById: async (req, res, next) => {
      try {
        const doc = await Model.findOne({ _id: req.params.id, businessId: req.user.businessId });
        if (!doc) {
          return sendError(res, 404, `${ModelName} not found`);
        }
        return sendSuccess(res, 200, `${ModelName} retrieved successfully`, doc);
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const doc = await Model.findOneAndUpdate(
          { _id: req.params.id, businessId: req.user.businessId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!doc) {
          return sendError(res, 404, `${ModelName} not found`);
        }
        return sendSuccess(res, 200, `${ModelName} updated successfully`, doc);
      } catch (error) {
        if (error.code === 11000) {
          return sendError(res, 400, `Duplicate value for unique field in ${ModelName}`);
        }
        next(error);
      }
    },

    delete: async (req, res, next) => {
      try {
        // Soft delete implementation
        const doc = await Model.findOneAndUpdate(
          { _id: req.params.id, businessId: req.user.businessId },
          { isActive: false },
          { new: true }
        );
        if (!doc) {
          return sendError(res, 404, `${ModelName} not found`);
        }
        return sendSuccess(res, 200, `${ModelName} deleted (deactivated) successfully`);
      } catch (error) {
        next(error);
      }
    }
  };
};
