// PatientModal.js
import React from "react";
import { Modal } from "react-modal";

const PatientModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  patientData,
  handleChange,
}) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-xl font-semibold mb-4">Register Patient</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="name"
          value={patientData.name}
          onChange={handleChange}
          placeholder="Patient Name"
          required
        />
        <input
          type="date"
          name="dob"
          value={patientData.dob}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contact"
          value={patientData.contact}
          onChange={handleChange}
          placeholder="Contact"
          required
        />
        <input
          type="text"
          name="insurance"
          value={patientData.insurance}
          onChange={handleChange}
          placeholder="Insurance"
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={onRequestClose}>
          Close
        </button>
      </form>
    </Modal>
  );
};

export default PatientModal;
