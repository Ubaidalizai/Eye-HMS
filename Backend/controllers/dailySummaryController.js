const asyncHandler = require('../middlewares/asyncHandler');

// Import all models
const OPD = require('../models/opdModule');
const OCT = require('../models/octModule');
const Laboratory = require('../models/labratoryModule');
const Bedroom = require('../models/bedroomModule');
const Ultrasound = require('../models/ultraSoundModule');
const Operation = require('../models/operationModule');
const Yeglizer = require('../models/yeglizerModel');
const Perimetry = require('../models/perimetryModel');
const FA = require('../models/FAModel');
const PRP = require('../models/PRPModel');
const Sale = require('../models/salesModel');

// Helper function to get date range for a specific date
const getDateRange = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

// Helper function to get records count and sales total for a model
const getModelSummary = async (Model, date, priceField = 'totalAmount') => {
  const { startOfDay, endOfDay } = getDateRange(date);

  const result = await Model.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        grossSales: {
          $sum: {
            $cond: [
              { $ifNull: ["$percentage", false] }, // if percentage exists
              {
                $divide: [
                  `$${priceField}`,
                  { $subtract: [1, { $divide: ["$percentage", 100] }] }
                ]
              },
              `$${priceField}` // otherwise just take totalAmount
            ]
          }
        }
      },
    },
  ]);

  return {
    count: result[0]?.count || 0,
    totalSales: result[0]?.grossSales || 0,
  };
};

// Get daily summary for all categories
exports.getDailySummary = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Date parameter is required'
    });
  }

  const targetDate = new Date(date);
  
  // Get summary for each category
  const [
    opdSummary,
    octSummary,
    laboratorySummary,
    bedroomSummary,
    ultrasoundSummary,
    operationSummary,
    yeglizerSummary,
    perimetrySummary,
    faSummary,
    prpSummary,
    glassesSummary,
    drugSummary,
  ] = await Promise.all([
    getModelSummary(OPD, targetDate),
    getModelSummary(OCT, targetDate),
    getModelSummary(Laboratory, targetDate),
    getModelSummary(Bedroom, targetDate),
    getModelSummary(Ultrasound, targetDate),
    getModelSummary(Operation, targetDate),
    getModelSummary(Yeglizer, targetDate),
    getModelSummary(Perimetry, targetDate),
    getModelSummary(FA, targetDate),
    getModelSummary(PRP, targetDate),
    // For glasses (from sales model)
    getSalesSummary(targetDate, ['glass', 'frame', 'sunglasses'], 'finalPrice'),
    // For drugs (from sales model)
    getSalesSummary(targetDate, ['drug'], 'income'),
  ]);

  const summary = {
    date: targetDate,
    categories: {
      opd: opdSummary,
      oct: octSummary,
      laboratory: laboratorySummary,
      bedroom: bedroomSummary,
      ultrasound: ultrasoundSummary,
      operation: operationSummary,
      yeglizer: yeglizerSummary,
      perimetry: perimetrySummary,
      fa: faSummary,
      prp: prpSummary,
      glasses: glassesSummary,
      pharmacy: drugSummary,
    },
    totals: {
      totalRecords: Object.values({
        opd: opdSummary,
        oct: octSummary,
        laboratory: laboratorySummary,
        bedroom: bedroomSummary,
        ultrasound: ultrasoundSummary,
        operation: operationSummary,
        yeglizer: yeglizerSummary,
        perimetry: perimetrySummary,
        fa: faSummary,
        prp: prpSummary,
        glasses: glassesSummary,
        pharmacy: drugSummary
      }).reduce((sum, category) => sum + category.count, 0),
      totalSales: Object.values({
        opd: opdSummary,
        oct: octSummary,
        laboratory: laboratorySummary,
        bedroom: bedroomSummary,
        ultrasound: ultrasoundSummary,
        operation: operationSummary,
        yeglizer: yeglizerSummary,
        perimetry: perimetrySummary,
        fa: faSummary,
        prp: prpSummary,
        glasses: glassesSummary,
        pharmacy: drugSummary,
      }).reduce((sum, category) => sum + category.totalSales, 0)
    }
  };

  res.status(200).json({
    status: 'success',
    data: summary
  });
});

// Helper function for sales summary
const getSalesSummary = async (date, categories, priceField = 'income') => {
  const { startOfDay, endOfDay } = getDateRange(date);
  
  const result = await Sale.aggregate([
    {
      $match: {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        category: { $in: categories }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalSales: { $sum: `$${priceField}` }
      }
    }
  ]);

  return {
    count: result[0]?.count || 0,
    totalSales: result[0]?.totalSales || 0
  };
};



// Get daily summaries for a date range
exports.getDailySummaries = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Both startDate and endDate parameters are required'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range (max 31 days)
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (daysDiff > 31) {
    return res.status(400).json({
      status: 'error',
      message: 'Date range cannot exceed 31 days'
    });
  }

  const summaries = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];

    // Get summary for each category for this date
    const [
      opdSummary,
      octSummary,
      laboratorySummary,
      bedroomSummary,
      ultrasoundSummary,
      operationSummary,
      yeglizerSummary,
      perimetrySummary,
      faSummary,
      prpSummary,
      glassesSummary,
      drugSummary,
    ] = await Promise.all([
      getModelSummary(OPD, currentDate),
      getModelSummary(OCT, currentDate),
      getModelSummary(Laboratory, currentDate),
      getModelSummary(Bedroom, currentDate),
      getModelSummary(Ultrasound, currentDate),
      getModelSummary(Operation, currentDate),
      getModelSummary(Yeglizer, currentDate),
      getModelSummary(Perimetry, currentDate),
      getModelSummary(FA, currentDate),
      getModelSummary(PRP, currentDate),
      getSalesSummary(currentDate, ['glass', 'frame', 'sunglasses'], 'finalPrice'),
      getSalesSummary(currentDate, ['drug']),
    ]);

    const dailySummary = {
      date: dateStr,
      categories: {
        opd: opdSummary,
        oct: octSummary,
        laboratory: laboratorySummary,
        bedroom: bedroomSummary,
        Bscan: ultrasoundSummary,
        operation: operationSummary,
        yeglizer: yeglizerSummary,
        perimetry: perimetrySummary,
        fa: faSummary,
        prp: prpSummary,
        glasses: glassesSummary,
        pharmacy: drugSummary,
      },
      totals: {
        totalRecords: Object.values({
          opd: opdSummary,
          oct: octSummary,
          laboratory: laboratorySummary,
          bedroom: bedroomSummary,
          ultrasound: ultrasoundSummary,
          operation: operationSummary,
          yeglizer: yeglizerSummary,
          perimetry: perimetrySummary,
          fa: faSummary,
          prp: prpSummary,
          glasses: glassesSummary,
          pharmacy: drugSummary
        }).reduce((sum, category) => sum + category.count, 0),
        totalSales: Object.values({
          opd: opdSummary,
          oct: octSummary,
          laboratory: laboratorySummary,
          bedroom: bedroomSummary,
          ultrasound: ultrasoundSummary,
          operation: operationSummary,
          yeglizer: yeglizerSummary,
          perimetry: perimetrySummary,
          fa: faSummary,
          prp: prpSummary,
          glasses: glassesSummary,
          pharmacy: drugSummary,
        }).reduce((sum, category) => sum + category.totalSales, 0)
      }
    };

    summaries.push(dailySummary);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(200).json({
    status: 'success',
    data: summaries
  });
});
