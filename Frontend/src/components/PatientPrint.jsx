import React, { forwardRef } from "react";

// forwardRef so react-to-print can reference it
const PatientPrint = forwardRef(({ patient, formImageUrl }, ref) => {
  return (
    <div ref={ref} className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Patient Record</h2>

      <div className="grid grid-cols-4 text-left">
        {/* fields in one row */}
        <p><strong>Name:</strong> {patient?.name}</p>
        <p><strong>Father Name:</strong> {patient?.fatherName}</p>
        <p><strong>Age:</strong> {patient?.age}</p>
        <p><strong>Contact:</strong> {patient?.contact}</p>
        <p><strong>Patient ID:</strong> {patient?.patientID}</p>
        <p><strong>Gender:</strong> {patient?.patientGender}</p>
        <p><strong>Date:</strong> {patient?.date?.split("T")[0]}</p>
        <p><strong>Insurance:</strong> {patient?.insuranceContact}</p>
      </div>
    
      {/* Attached image form under patient data */}
      {formImageUrl && (
        <div className="mt-6">
          <img
            src={formImageUrl}
            alt="Attached form"
            className="w-full h-auto border"
          />
        </div>
      )}
    </div>
  );
});

export default PatientPrint;
