const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('./appError');

const { getDateRangeForYear, getDateRangeForMonth } = require('./dateUtils');
const { getAggregatedData, populateDataArray } = require('./aggregationUtils');

const getDataByYear = async (year, Model) => {
  // Validate the input year
  if (!year || isNaN(year)) {
    throw new AppError('Invalid year provided.', 400);
  }

  // Get the date range for the specified year
  const { startDate, endDate } = getDateRangeForYear(year);

  // Match criteria for filtering records
  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate }, // Filter data within the year
  };

  // Group data by month and sum total amount
  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$totalAmount' },
  };

  // Fetch aggregated data
  const aggregatedData = await getAggregatedData(Model, matchCriteria, groupBy);
  // Populate data to fill missing months with zero values
  const chartData = populateDataArray(aggregatedData, 12, 'month');

  // Return the processed chart data
  return chartData;
};

// Utility function for fetching monthly data
const getDataByMonth = async (year, month, Model) => {
  // Validate year and month inputs
  if (
    !year ||
    isNaN(year) ||
    !month ||
    isNaN(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new AppError('Invalid year or month provided.', 400);
  }
  console.log(year, month);
  // Get the date range for the given month
  const { startDate, endDate } = getDateRangeForMonth(year, month);

  // Match criteria for filtering records
  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate }, // Filter data for the given month
  };

  // Group data by day and sum total amounts
  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: '$totalAmount' },
  };

  const aggregatedData = await getAggregatedData(Model, matchCriteria, groupBy);

  // Get total days in the specified month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Populate missing days with zero values
  const chartData = populateDataArray(aggregatedData, daysInMonth, 'day');

  return chartData;
};

module.exports = {
  getDataByYear,
  getDataByMonth,
};
