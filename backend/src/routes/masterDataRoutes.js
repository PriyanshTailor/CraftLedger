import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { ROLES } from '../config/roles.js';
import { createController } from '../controllers/factoryController.js';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import AnalyticAccount from '../models/AnalyticAccount.js';
import {
  contactSchema, productSchema, productCategorySchema,
  accountSchema, journalSchema, analyticAccountSchema
} from '../validators/masterDataValidators.js';

const router = express.Router();
router.use(authenticateUser);

const bizRoles  = [ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT];
const ownerOnly = [ROLES.BUSINESS_OWNER];

// Customer: own profile (linked contact)
router.get('/contacts/me', authorizeRoles(ROLES.CONTACT), async (req, res, next) => {
  const { sendSuccess, sendError } = await import('../utils/response.js');
  try {
    if (!req.user.contactId) return sendError(res, 404, 'No contact profile linked to your account');
    const contact = await Contact.findOne({ _id: req.user.contactId, businessId: req.user.businessId });
    if (!contact) return sendError(res, 404, 'Contact profile not found');
    return sendSuccess(res, 200, 'Contact profile retrieved', contact);
  } catch (e) { next(e); }
});

const setupRoutes = (path, Model, schema, ModelName) => {
  const ctrl = createController(Model, ModelName);
  router.route(path)
    .get(authorizeRoles(...bizRoles), ctrl.getAll)
    .post(authorizeRoles(...bizRoles), validate(schema), ctrl.create);
  router.route(`${path}/:id`)
    .get(authorizeRoles(...bizRoles), ctrl.getById)
    .put(authorizeRoles(...bizRoles), validate(schema), ctrl.update)
    .patch(authorizeRoles(...bizRoles), validate(schema), ctrl.update);
  router.patch(`${path}/:id/archive`, authorizeRoles(...ownerOnly), ctrl.delete);
};

setupRoutes('/contacts',          Contact,          contactSchema,          'Contact');
setupRoutes('/products',          Product,          productSchema,          'Product');
setupRoutes('/product-categories',ProductCategory,  productCategorySchema,  'ProductCategory');
setupRoutes('/accounts',          Account,          accountSchema,          'Account');
setupRoutes('/journals',          Journal,          journalSchema,          'Journal');
setupRoutes('/analytic-accounts', AnalyticAccount,  analyticAccountSchema,  'AnalyticAccount');

export default router;
