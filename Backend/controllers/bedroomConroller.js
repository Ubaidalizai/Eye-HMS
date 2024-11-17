const Bedroom = require('../models/bedroomModule');

// Create a new bedroom
const createBedroom = async (req, res) => {
  try {
    const bedroom = new Bedroom(req.body);
    await bedroom.save();
    res.status(201).json({ message: 'Bedroom created successfully', bedroom });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bedroom', error });
  }
};

// Get all bedrooms
const getAllBedrooms = async (req, res) => {
  try {
    const bedrooms = await Bedroom.find();
    res.status(200).json(bedrooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve bedrooms', error });
  }
};

// Update a bedroom by ID
const updateBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!bedroom) {
      return res.status(404).json({ message: 'Bedroom not found' });
    }
    res.status(200).json({ message: 'Bedroom updated successfully', bedroom });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bedroom', error });
  }
};

// Delete a bedroom by ID
const deleteBedroom = async (req, res) => {
  try {
    const { id } = req.params;
    const bedroom = await Bedroom.findByIdAndDelete(id);
    if (!bedroom) {
      return res.status(404).json({ message: 'Bedroom not found' });
    }
    res.status(200).json({ message: 'Bedroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bedroom', error });
  }
};

module.exports = {
  createBedroom,
  getAllBedrooms,
  updateBedroom,
  deleteBedroom,
};
