const Bedroom = require('../models/bedroomModule');
// Create a new bedroom
const createBedroom = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if a record with the same 'id' already exists
    const existingBedroom = await Bedroom.findOne({ id });
    if (existingBedroom) {
      return res.status(400).json({
        success: false,
        message: 'Bedroom with this ID already exists',
      });
    }

    const bedroom = new Bedroom(req.body);
    await bedroom.save();
    res.status(201).json({
      success: true,
      message: 'Bedroom created successfully',
      data: bedroom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create bedroom',
      error: error.message,
    });
  }
};

// Get all bedrooms
const getAllBedrooms = async (req, res) => {
  try {
    const bedrooms = await Bedroom.find();
    res.status(200).json({
      success: true,
      message: 'Bedrooms retrieved successfully',
      data: bedrooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bedrooms',
      error: error.message,
    });
  }
};

// Get a bedroom by schema `id`
const getBedroomById = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.findOne({ id }); // Find by schema-defined `id`
    if (!bedroom) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Bedroom retrieved successfully',
      data: bedroom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bedroom',
      error: error.message,
    });
  }
};

// Update a bedroom by schema `id`
const updateBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.findOneAndUpdate(
      { id }, // Match using schema-defined `id`
      req.body,
      {
        new: true,
        runValidators: true, // Ensures validation rules are applied
      }
    );
    if (!bedroom) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Bedroom updated successfully',
      data: bedroom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update bedroom',
      error: error.message,
    });
  }
};

// Delete a bedroom by schema `id`
const deleteBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.findOneAndDelete({ id }); // Match using schema-defined `id`
    if (!bedroom) {
      return res.status(404).json({
        success: false,
        message: 'Bedroom not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Bedroom deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bedroom',
      error: error.message,
    });
  }
};

module.exports = {
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
};
