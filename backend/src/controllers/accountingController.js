import mongoose from 'mongoose';
import JournalEntry from '../models/JournalEntry.js';
import Account from '../models/Account.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
  getLedgerTransactions,
  calculateTrialBalance
} from '../services/accountingService.js';

export const createEntry = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessId = req.user.businessId;
    const entryData = { ...req.body, createdBy: req.user._id };

    // Fetch account names for snapshots
    for (const line of entryData.lines) {
      const acc = await Account.findOne({ _id: line.accountId, businessId }).session(session);
      if (!acc) throw new Error(`Account ${line.accountId} not found`);
      line.accountNameSnapshot = acc.accountName;
    }

    const entry = await createJournalEntry(businessId, entryData, session);

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Journal Entry created successfully', entry);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getEntries = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find({ businessId: req.user.businessId })
      .populate('journalId', 'name')
      .populate('createdBy', 'name')
      .sort('-entryDate -createdAt');
    return sendSuccess(res, 200, 'Journal entries retrieved', entries);
  } catch (error) {
    next(error);
  }
};

export const getEntryById = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('journalId', 'name')
      .populate('createdBy', 'name');
    
    if (!entry) return sendError(res, 404, 'Journal entry not found');
    return sendSuccess(res, 200, 'Journal entry retrieved', entry);
  } catch (error) {
    next(error);
  }
};

export const postEntry = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const entry = await postJournalEntry(req.params.id, req.user.businessId, session);
    
    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 200, 'Journal Entry posted successfully', entry);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const reverseEntry = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reversal = await reverseJournalEntry(req.params.id, req.user.businessId, req.user._id, session);
    
    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Journal Entry reversed successfully', reversal);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getLedger = async (req, res, next) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    if (!accountId) return sendError(res, 400, 'accountId query parameter is required');

    const transactions = await getLedgerTransactions(accountId, req.user.businessId, startDate, endDate);
    return sendSuccess(res, 200, 'Ledger retrieved', transactions);
  } catch (error) {
    next(error);
  }
};

export const getTrialBalance = async (req, res, next) => {
  try {
    const asOfDate = req.query.date ? new Date(req.query.date) : new Date();
    const tb = await calculateTrialBalance(req.user.businessId, asOfDate);
    return sendSuccess(res, 200, 'Trial Balance retrieved', tb);
  } catch (error) {
    next(error);
  }
};
