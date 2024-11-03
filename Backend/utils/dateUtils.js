// dateUtils.js

// Calculate start and end dates for a specific year
const getDateRangeForYear = (year) => ({
  startDate: new Date(`${year}-01-01T00:00:00Z`),
  endDate: new Date(`${year}-12-31T23:59:59Z`),
});

// Calculate start and end dates for a specific month
const getDateRangeForMonth = (year, month) => ({
  startDate: new Date(year, month - 1, 1),
  endDate: new Date(year, month, 0),
});

module.exports = { getDateRangeForYear, getDateRangeForMonth };
