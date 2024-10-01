import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const PrescriptionModal = ({ show, onClose, onSave, patient }) => {
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

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Prescription for {patient.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="mb-3">
            <label htmlFor="medication" className="form-label">
              Medication
            </label>
            <input
              type="text"
              className="form-control"
              id="medication"
              name="medication"
              value={prescriptionData.medication}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="dosage" className="form-label">
              Dosage
            </label>
            <input
              type="text"
              className="form-control"
              id="dosage"
              name="dosage"
              value={prescriptionData.dosage}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="frequency" className="form-label">
              Frequency
            </label>
            <input
              type="text"
              className="form-control"
              id="frequency"
              name="frequency"
              value={prescriptionData.frequency}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="duration" className="form-label">
              Duration
            </label>
            <input
              type="text"
              className="form-control"
              id="duration"
              name="duration"
              value={prescriptionData.duration}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Prescription
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrescriptionModal;
