const Pharmacy = require("../models/pharmacyModel");
const Product = require("../models/product");
const Purchase = require("../models/purchase");
const getAll = require("./handleFactory");

const asyncHandler = require("../middlewares/asyncHandler");
const validateMongoDBId = require("../utils/validateMongoDBId");

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

// GET SINGLE DRUG
exports.getDrug = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findById(id);
    if (!drug) {
      res.status(404);
      throw new Error("Drug not found");
    }
    res.status(200).json({
      status: "success",
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to retrieve the drug");
  }
});

exports.updateDrug = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the update operation against the schema
    });

    if (!drug) {
      res.status(404);
      throw new Error("Drug not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to update the drug");
  }
});

// pharmacyController.js
exports.deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    await Pharmacy.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to delete the drug");
  }
};
exports.checkDrugExpiry = asyncHandler(async (req, res) => {
  const beforeThirtyDays = new Date();
  beforeThirtyDays.setDate(beforeThirtyDays.getDate() + 30);

  const expireProducts = await Product.find({
    expiryDate: { $lte: beforeThirtyDays },
    stock: { $gt: 0 },
  }); // Find products with an expiry date before 30 days

  if (expireProducts.length === 0) {
    return res.status(200).json({ message: "No expired products found" });
  }

  res.status(200).json({ expireProducts });
});
