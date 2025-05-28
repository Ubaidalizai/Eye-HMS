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

    let records;
    // Only populate for models other than Ultrasound and Oct
    if (Model.modelName !== 'Ultrasound' && Model.modelName !== 'OCT') {
      records = await Model.find({ patientId: patient._id })
        .populate('patientId', 'name')
        .populate('doctor', 'firstName lastName');
    } else {
      records = await Model.find({ patientId: patient._id }).populate(
        'patientId',
        'name'
      );
    }

    return {
      records,
    };
  } catch (error) {
    console.error('Error retrieving patient records:', error);
    throw new Error('Failed to retrieve patient records.');
  }
};

module.exports = getPatientRecordsByPatientID;
