// aggregationUtils.js

const getAggregatedData = async (Model, matchCriteria, groupBy) => {
  try {
    const aggregation = await Model.aggregate([
      { $match: matchCriteria },
      { $group: groupBy },
      { $sort: { _id: 1 } },
    ]);
    return aggregation;
  } catch (error) {
    throw new Error(`Failed to aggregate data: ${error.message}`);
  }
};

// Populate data array based on grouping (days or months)
const populateDataArray = (data, length, key) => {
  const populatedArray = new Array(length).fill(0);
  data.forEach((item) => {
    populatedArray[item._id[key] - 1] = item.totalAmount;
  });
  return populatedArray;
};

module.exports = { getAggregatedData, populateDataArray };
