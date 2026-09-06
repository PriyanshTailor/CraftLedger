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
        const {
          search,
          sort,
          page = 1,
          limit = 10,
          includeArchived,
          archived,
          ...filters
        } = req.query;
        const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
        
        // Base query scoped to business
        const query = { businessId: req.user.businessId, ...filters };
        if (archived === 'true') {
          query.$or = [{ isArchived: true }, { isActive: false }];
        } else if (includeArchived !== 'true') {
          query.isActive = true;
          query.isArchived = { $ne: true };
        }

        // Search logic (name or code/sku if applicable)
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { accountCode: { $regex: search, $options: 'i' } }
          ].filter(q => Object.keys(Model.schema.paths).includes(Object.keys(q)[0]));
        }

        const skip = (parsedPage - 1) * parsedLimit;
        const docs = await Model.find(query)
          .sort(sort || '-createdAt')
          .skip(skip)
          .limit(parsedLimit);
        
        const total = await Model.countDocuments(query);

        return sendSuccess(res, 200, `${ModelName}s retrieved successfully`, {
          docs,
          total,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit)
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
          { isActive: false, isArchived: true, archivedAt: new Date() },
          { new: true }
        );
        if (!doc) {
          return sendError(res, 404, `${ModelName} not found`);
        }
        return sendSuccess(res, 200, `${ModelName} archived successfully`, doc);
      } catch (error) {
        next(error);
      }
    },

    restore: async (req, res, next) => {
      try {
        const doc = await Model.findOneAndUpdate(
          { _id: req.params.id, businessId: req.user.businessId },
          { isActive: true, isArchived: false, archivedAt: null },
          { new: true, runValidators: true }
        );
        if (!doc) {
          return sendError(res, 404, `${ModelName} not found`);
        }
        return sendSuccess(res, 200, `${ModelName} restored successfully`, doc);
      } catch (error) {
        next(error);
      }
    }
  };
};
