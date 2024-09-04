const Pharmacy = require('../models/pharmacyModel');
const pharmacySale = require('../models/pharmacySaleModel');

const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

exports.getAllDrugsInPharmacy = asyncHandler(async (req, res) => {
  try {
    const drugs = await Pharmacy.find();
    res.status(200).json(drugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.sellDrugs = asyncHandler(async (req, res) => {
  try {
    const { drugsSold } = req.body; // Array of drug IDs and quantities [{ drugId, quantity }, ...]
    let totalIncome = 0;
    const soldItems = [];

    for (const item of drugsSold) {
      const drug = await Pharmacy.findById(item.drugId);

      if (!drug) {
        res.status(404);
        throw new Error(`Drug with ID ${item.drugId} not found`);
      }

      if (drug.quantity < item.quantity) {
        res.status(400);
        throw new Error(`Not enough quantity for drug: ${drug.name}`);
      }

      // Ensure price and quantity are valid numbers
      if (isNaN(drug.salePrice) || isNaN(item.quantity)) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid price or quantity for drug: ${drug.name}`,
        });
      }

      // Calculate income for this drug
      const income = drug.salePrice * item.quantity;
      totalIncome += income;

      // Update drug quantity
      drug.quantity -= item.quantity;
      await drug.save();

      // Record the sale item
      soldItems.push({
        drugId: drug._id,
        name: drug.name,
        quantity: item.quantity,
        salePrice: drug.salePrice,
        income,
      });
    }

    // Create a sale record
    const sale = await pharmacySale.create({
      soldItems,
      totalIncome,
      date: Date.now(),
    });
    res.status(201).json({
      status: 'success',
      data: {
        sale,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to complete the sale', error.message);
  }
});

// pharmacyController.js
exports.getDrug = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findById(id);
    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to retrieve the drug');
  }
});

// pharmacyController.js
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
      throw new Error('Drug not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to update the drug');
  }
});

// pharmacyController.js
exports.deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findByIdAndDelete(id);

    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to delete the drug');
  }
};
