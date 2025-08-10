const Patient = require('../models/patientModel');

const getPatientRecordsByPatientID = async (req, res) => {
  try {
    const { patientID } = req.params;
    const { Model } = req;
    const { page = 1, limit = 10 } = req.query;

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const skip = (currentPage - 1) * perPage;

    // Step 1: Find patient
    const patient = await Patient.findOne({ patientID });

    // If no patient, return empty result — not error
    if (!patient) {
      return {
        success: true,
        message: 'No patient found with the given ID',
        currentPage,
        totalPages: 0,
        totalResults: 0,
        records: [],
      };
    }

    // Step 2: Build populate fields dynamically
    const populateFields = [{ path: 'patientId', select: 'name' }];

    if (Model.schema.path('doctor')) {
      populateFields.push({ path: 'doctor', select: 'firstName lastName' });
    }

    Model.schema.eachPath((fieldName, schemaType) => {
      const isObjectId =
        schemaType.instance === 'ObjectID' || schemaType.options?.ref;

      const isTypeField =
        fieldName.toLowerCase() === 'type' ||
        fieldName.toLowerCase().endsWith('type');

      if (isObjectId && isTypeField) {
        populateFields.push({ path: fieldName, select: 'name' });
      }
    });

    // Step 3: Count records
    const totalRecords = await Model.countDocuments({ patientId: patient._id });

    // Step 4: Fetch paginated and populated records
    let query = Model.find({ patientId: patient._id })
      .skip(skip)
      .limit(perPage);

    populateFields.forEach((pop) => {
      query = query.populate(pop);
    });

    const records = await query;
    // Step 5: Return success with records or empty
    return {
      success: true,
      currentPage,
      totalPages: Math.ceil(totalRecords / perPage),
      results: totalRecords,
      records,
    };
  } catch (error) {
    console.error('Error retrieving patient records:', error);
    return {
      success: false,
      message: 'Server error while fetching records.',
      error: error.message,
    };
  }
};

module.exports = getPatientRecordsByPatientID;
