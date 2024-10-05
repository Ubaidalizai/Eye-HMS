const Purchase = require('../models/purchase');
const purchaseStock = require('./purchaseStock');
<<<<<<< HEAD
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');

// Add Purchase Details
const addPurchase = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);
  const {
    productID,
    quantityPurchased,
    purchaseDate,
    unitPurchaseAmount,
    category,
  } = req.body;

  // Validate required fields
  if (
    !productID ||
    !quantityPurchased ||
    !purchaseDate ||
    !unitPurchaseAmount ||
    !category
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
      UnitPurchaseAmount: unitPurchaseAmount,
      category,
    });

    // Update product stock after purchase
    await purchaseStock(productID, quantityPurchased);

    // Send success response
    res.status(200).json({
      message: 'Purchase added successfully',
      data: { purchaseDetails },
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Error while adding purchase');
  }
});

// Get All Purchase Data with Product Name And Also By Category
const getPurchaseData = getAll(Purchase, true, {
  path: 'ProductID',
  select: 'name',
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

module.exports = {
  addPurchase,
  getPurchaseData,
  getTotalPurchaseAmount,
};
=======

// Add Purchase Details
const addPurchase = (req, res) => {
  console.log(req.body);
  const addPurchaseDetails = new Purchase({
    userID: req.body.userID,
    ProductID: req.body.productID,
    QuantityPurchased: req.body.quantityPurchased,
    PurchaseDate: req.body.purchaseDate,
    TotalPurchaseAmount: req.body.totalPurchaseAmount,
  });

  addPurchaseDetails
    .save()
    .then((result) => {
      purchaseStock(req.body.productID, req.body.quantityPurchased);
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(402).send(err);
    });
};

// Get All Purchase Data
const getPurchaseData = async (req, res) => {
  const findAllPurchaseData = await Purchase.find({
    userID: req.params.userID,
  }).sort({ _id: -1 }); // -1 for descending order
  res.json(findAllPurchaseData);
};

// Get total purchase amount
const getTotalPurchaseAmount = async (req, res) => {
  let totalPurchaseAmount = 0;
  const purchaseData = await Purchase.find({ userID: req.params.userID });
  purchaseData.forEach((purchase) => {
    totalPurchaseAmount += purchase.TotalPurchaseAmount;
  });
  res.json({ totalPurchaseAmount });
};

module.exports = { addPurchase, getPurchaseData, getTotalPurchaseAmount };
>>>>>>> origin/master
