import React, { useState } from "react";

export default function PrescriptionModal({ show, onClose, onSave, patient }) {
  const [prescriptionData, setPrescriptionData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData({ ...prescriptionData, [name]: value });
  };

  const handleSave = () => {
    onSave(prescriptionData);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2 className='modal-title'>Create Prescription for {patient.name}</h2>
        <div className='form-grid'>
          <div className='form-group'>
            <label htmlFor='medication' className='form-label'>
              Medication
            </label>
            <input
              id='medication'
              name='medication'
              value={prescriptionData.medication}
              onChange={handleInputChange}
              className='form-input'
            />
          </div>
          <div className='form-group'>
            <label htmlFor='dosage' className='form-label'>
              Dosage
            </label>
            <input
              id='dosage'
              name='dosage'
              value={prescriptionData.dosage}
              onChange={handleInputChange}
              className='form-input'
            />
          </div>
          <div className='form-group'>
            <label htmlFor='frequency' className='form-label'>
              Frequency
            </label>
            <input
              id='frequency'
              name='frequency'
              value={prescriptionData.frequency}
              onChange={handleInputChange}
              className='form-input'
            />
          </div>
          <div className='form-group'>
            <label htmlFor='duration' className='form-label'>
              Duration
            </label>
            <input
              id='duration'
              name='duration'
              value={prescriptionData.duration}
              onChange={handleInputChange}
              className='form-input'
            />
          </div>
        </div>
        <div className='modal-footer'>
          <button className='button button-outline' onClick={onClose}>
            Cancel
          </button>
          <button className='button button-primary' onClick={handleSave}>
            Save Prescription
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
        }
        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
        .form-grid {
          display: grid;
          gap: 15px;
        }
        .form-group {
          display: grid;
          grid-template-columns: 1fr 3fr;
          align-items: center;
          gap: 10px;
        }
        .form-label {
          text-align: right;
        }
        .form-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        .modal-footer {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        .button-outline {
          background-color: transparent;
          border: 1px solid #ccc;
        }
        .button-primary {
          background-color: #007bff;
          color: white;
        }
      `}</style>
    </div>
  );
}
