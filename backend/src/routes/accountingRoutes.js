import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { ROLES } from '../config/roles.js';
import { createJournalEntrySchema } from '../validators/accountingValidators.js';
import {
  createEntry, getEntries, getEntryById,
  postEntry, reverseEntry, getLedger, getTrialBalance
} from '../controllers/accountingController.js';

const router = express.Router();
router.use(authenticateUser);

const bizRoles = [ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT];
router.use(authorizeRoles(...bizRoles));

router.route('/journal-entries')
  .post(validate(createJournalEntrySchema), createEntry)
  .get(getEntries);
router.route('/journal-entries/:id').get(getEntryById);
router.post('/journal-entries/:id/post', postEntry);
router.post('/journal-entries/:id/reverse', authorizeRoles(ROLES.BUSINESS_OWNER), reverseEntry);
router.get('/ledger', getLedger);
router.get('/trial-balance', getTrialBalance);

export default router;
