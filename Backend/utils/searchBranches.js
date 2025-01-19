const Patient = require('../models/patientModel');

const getPatientRecordsByPatientID = async (patientID, Model) => {
  try {
    const patient = await Patient.findOne({ patientID });
    if (!patient) {
      return {
        message: 'No patient found with the given ID',
        records: [],
      };
    }
    // Step 2: Find records in the specified model associated with the patient
    const records = await Model.find({ patientId: patient._id })
      .populate('patientId', 'name')
      .populate('doctor', 'firstName lastName');

    return {
      records,
    };
  } catch (error) {
    console.error('Error retrieving patient records:', error);
    throw new Error('Failed to retrieve patient records.');
  }
};

module.exports = getPatientRecordsByPatientID;
