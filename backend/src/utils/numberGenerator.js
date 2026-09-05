import Sequence from '../models/Sequence.js';

export const generateNextNumber = async (businessId, entityName, prefix) => {
  const sequence = await Sequence.findOneAndUpdate(
    { businessId, entityName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(sequence.sequenceValue).padStart(5, '0');
  
  // Format: PREFIX-YYMM-XXXXX
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${prefix}-${year}${month}-${paddedSequence}`;
};
