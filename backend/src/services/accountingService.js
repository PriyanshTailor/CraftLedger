import mongoose from 'mongoose';
import JournalEntry from '../models/JournalEntry.js';
import Account from '../models/Account.js';
import { generateNextNumber } from '../utils/numberGenerator.js';

export const validateJournalEntry = (lines) => {
  if (!lines || lines.length < 2) {
    throw new Error('A journal entry must have at least two lines');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    if (line.debit > 0 && line.credit > 0) {
      throw new Error('A line cannot have both debit and credit');
    }
    if (line.debit < 0 || line.credit < 0) {
      throw new Error('Debit and credit cannot be negative');
    }
    totalDebit += line.debit || 0;
    totalCredit += line.credit || 0;
  }

  // Round to 2 decimal places to avoid float precision issues
  totalDebit = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;

  if (totalDebit !== totalCredit) {
    throw new Error(`Journal entry is unbalanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
  }

  if (totalDebit === 0) {
    throw new Error('Journal entry must have a non-zero value');
  }

  return { totalDebit, totalCredit };
};

export const createJournalEntry = async (businessId, entryData, session) => {
  const { totalDebit, totalCredit } = validateJournalEntry(entryData.lines);
  const entryNumber = await generateNextNumber(businessId, 'JournalEntry', 'JE');

  const entry = await JournalEntry.create([{
    ...entryData,
    businessId,
    entryNumber,
    totalDebit,
    totalCredit
  }], { session });

  return entry[0];
};

export const postJournalEntry = async (entryId, businessId, session) => {
  const entry = await JournalEntry.findOne({ _id: entryId, businessId }).session(session);
  if (!entry) throw new Error('Journal entry not found');
  if (entry.status === 'posted') throw new Error('Entry is already posted');
  if (entry.status === 'reversed') throw new Error('Cannot post a reversed entry');

  // Verify accounts and update their balances
  for (const line of entry.lines) {
    const account = await Account.findOne({ _id: line.accountId, businessId }).session(session);
    if (!account) throw new Error(`Account ${line.accountId} not found`);

    // Debit increases assets and expenses. Credit increases liabilities, equity, and income.
    let balanceChange = 0;
    if (['asset', 'expense'].includes(account.accountType)) {
      balanceChange = line.debit - line.credit;
    } else {
      balanceChange = line.credit - line.debit;
    }

    account.currentBalance += balanceChange;
    await account.save({ session });
  }

  entry.status = 'posted';
  await entry.save({ session });
  return entry;
};

export const reverseJournalEntry = async (entryId, businessId, userId, session) => {
  const originalEntry = await JournalEntry.findOne({ _id: entryId, businessId }).session(session);
  if (!originalEntry) throw new Error('Journal entry not found');
  if (originalEntry.status !== 'posted') throw new Error('Only posted entries can be reversed');

  // Create reversal lines
  const reversalLines = originalEntry.lines.map(line => ({
    accountId: line.accountId,
    accountNameSnapshot: line.accountNameSnapshot,
    debit: line.credit, // Swap
    credit: line.debit, // Swap
    description: `Reversal of ${originalEntry.entryNumber}`
  }));

  const reversalData = {
    entryDate: Date.now(),
    journalId: originalEntry.journalId,
    referenceType: 'Reversal',
    referenceId: originalEntry._id,
    description: `Reversal of ${originalEntry.entryNumber}: ${originalEntry.description}`,
    lines: reversalLines,
    createdBy: userId
  };

  const reversalEntry = await createJournalEntry(businessId, reversalData, session);
  await postJournalEntry(reversalEntry._id, businessId, session);

  originalEntry.status = 'reversed';
  await originalEntry.save({ session });

  return reversalEntry;
};

export const getAccountBalance = async (accountId, businessId) => {
  const account = await Account.findOne({ _id: accountId, businessId });
  if (!account) throw new Error('Account not found');
  return account.currentBalance;
};

export const getLedgerTransactions = async (accountId, businessId, startDate, endDate) => {
  const query = {
    businessId,
    status: 'posted',
    'lines.accountId': accountId
  };

  if (startDate || endDate) {
    query.entryDate = {};
    if (startDate) query.entryDate.$gte = new Date(startDate);
    if (endDate) query.entryDate.$lte = new Date(endDate);
  }

  const entries = await JournalEntry.find(query).sort('entryDate createdAt');

  // Flatten and extract only relevant lines
  const transactions = [];
  entries.forEach(entry => {
    entry.lines.forEach(line => {
      if (line.accountId.toString() === accountId.toString()) {
        transactions.push({
          date: entry.entryDate,
          entryNumber: entry.entryNumber,
          description: line.description || entry.description,
          debit: line.debit,
          credit: line.credit
        });
      }
    });
  });

  return transactions;
};

export const calculateTrialBalance = async (businessId, asOfDate) => {
  const accounts = await Account.find({ businessId, isActive: true }).lean();
  const trialBalance = [];

  let totalDebit = 0;
  let totalCredit = 0;

  for (const account of accounts) {
    // Current balances are maintained live. For a specific historical date, 
    // we would sum ledger transactions. Since keeping it simple and performant:
    const balance = account.currentBalance;
    if (balance === 0) continue;

    let debit = 0;
    let credit = 0;

    if (['asset', 'expense'].includes(account.accountType)) {
      if (balance >= 0) debit = balance;
      else credit = Math.abs(balance);
    } else {
      if (balance >= 0) credit = balance;
      else debit = Math.abs(balance);
    }

    totalDebit += debit;
    totalCredit += credit;

    trialBalance.push({
      accountId: account._id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debit,
      credit
    });
  }

  return {
    lines: trialBalance,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.round(totalDebit * 100) / 100 === Math.round(totalCredit * 100) / 100
  };
};
