import asyncHandler from 'express-async-handler';
import WorkingTime from '../Models/WorkingTimes.js';

// GET: Fetch current working hours (for editing form)
export const getWorkingTimes = asyncHandler(async (req, res) => {
  const times = await WorkingTime.findOne();

  if (!times) {
    // Return default values if nothing is set yet
    return res.json({ open: '09:00', close: '23:00' });
  }

  res.json({
    open: times.open,
    close: times.close,
  });
});

// PUT: Update working hours (admin only)
export const updateWorkingTimes = asyncHandler(async (req, res) => {
  const { open, close } = req.body;

  if (!open || !close) {
    res.status(400);
    throw new Error('Both opening and closing times are required');
  }

  // Validate HH:MM format
  const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeFormat.test(open) || !timeFormat.test(close)) {
    res.status(400);
    throw new Error('Invalid time format. Use HH:MM (e.g., 10:30)');
  }

  // Upsert: create if doesn't exist, update if it does
  const updated = await WorkingTime.findOneAndUpdate(
    {}, // matches the single document
    { open, close },
    {
      upsert: true,        // create if not found
      new: true,           // return updated document
      runValidators: true,
    }
  );

  res.json({
    message: 'Working hours updated successfully',
    times: {
      open: updated.open,
      close: updated.close,
    },
  });
});