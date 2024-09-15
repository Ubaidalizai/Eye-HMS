const Purchase = require('../models/purchase');
const purchaseStock = require('./purchaseStock');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');

// Add Purchase Details
const addPurchase = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);

  const { productID, quantityPurchased, purchaseDate, totalPurchaseAmount } =
    req.body;

  // Validate required fields
  if (
    !productID ||
    !quantityPurchased ||
    !purchaseDate ||
    !totalPurchaseAmount
  ) {
    res.status(400);
    throw new Error('All fields are required.');
  }

  try {
    // Create a new Purchase entry
    const purchaseDetails = await Purchase.create({
      userID,
      ProductID: productID,
      QuantityPurchased: quantityPurchased,
      PurchaseDate: purchaseDate,
      TotalPurchaseAmount: totalPurchaseAmount,
    });

    // Update product stock after purchase
    await purchaseStock(productID, quantityPurchased);

    // Send success response
    res.status(200).json({
      message: 'Purchase added successfully',
      data: { purchaseDetails },
    });
  } catch (error) {
    // Handle errors gracefully
    res.status(500);
    throw new Error({ message: 'Error adding purchase', error: error.message });
  }
});

// Get All Purchase Data
const getPurchaseData = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  const { page = 1, limit = 10 } = req.query; // Pagination params (optional)

  try {
    // Find purchases and apply pagination and sorting
    const purchases = await Purchase.find({ userID })
      .populate('ProductID')
      .sort({ _id: -1 }) // Sort by ID in descending order
      .skip((page - 1) * limit) // Skip to the correct page
      .limit(Number(limit)); // Limit the results to the specified page size
    if (!purchases) {
      res.status(404);
      throw new Error('No purchases found');
    }
    // Total count for pagination
    const totalPurchases = await Purchase.countDocuments({ userID });
    const totalPages = Math.ceil(totalPurchases / limit);

    // Return the data along with pagination info
    res.status(200).json({
      status: 'success',
      data: purchases,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    // Handle any errors
    res.status(500);
    console.log(error);
    throw new Error('Some thing went wrong');
  }
});

// Get total purchase amount
const getTotalPurchaseAmount = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID); // Check if _id is valid

  try {
    // Use aggregation to calculate the total purchase amount
    const result = await Purchase.aggregate([
      { $match: { userID: mongoose.Types.ObjectId(userID) } },
      {
        $group: {
          _id: null,
          totalPurchaseAmount: { $sum: '$TotalPurchaseAmount' },
        },
      },
    ]);

    const totalPurchaseAmount =
      result.length > 0 ? result[0].totalPurchaseAmount : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalPurchaseAmount,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error calculating total purchase amount');
  }
});

module.exports = { addPurchase, getPurchaseData, getTotalPurchaseAmount };
