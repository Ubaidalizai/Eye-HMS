import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function PrescriptionForm() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    doctor: "",
    rightEye: { sphere: "", cylinder: "", axis: "" },
    leftEye: { sphere: "", cylinder: "", axis: "" },
    pdDistance: "",
    pdNear: "",
    addPower: "",
    lensType: "",
  });

  useEffect(() => {
    if (prescriptionId) {
      // Simulating API call to fetch prescription data for editing
      setFormData({
        date: "2023-06-01",
        doctor: "Dr. Smith",
        rightEye: { sphere: "-1.00", cylinder: "-0.50", axis: "180" },
        leftEye: { sphere: "-1.25", cylinder: "-0.75", axis: "175" },
        pdDistance: "62",
        pdNear: "60",
        addPower: "+2.00",
        lensType: "Progressive",
      });
    }
  }, [prescriptionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEyeChange = (eye, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [eye]: {
        ...prevData[eye],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulating API call to save prescription
    console.log("Saving prescription:", formData);
    navigate("/patients/1/prescriptions"); // Redirect to prescription list
  };

  return (
    <div>
      <h1 className='text-2xl font-semibold mb-4'>
        {prescriptionId ? "Edit" : "Add"} Prescription
      </h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='date'
            className='block text-sm font-medium text-gray-700'
          >
            Date
          </label>
          <input
            type='date'
            id='date'
            name='date'
            value={formData.date}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div>
          <label
            htmlFor='doctor'
            className='block text-sm font-medium text-gray-700'
          >
            Doctor
          </label>
          <input
            type='text'
            id='doctor'
            name='doctor'
            value={formData.doctor}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Right Eye</h3>
            <div className='mt-2 space-y-2'>
              <input
                type='text'
                placeholder='Sphere'
                value={formData.rightEye.sphere}
                onChange={(e) =>
                  handleEyeChange("rightEye", "sphere", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
              <input
                type='text'
                placeholder='Cylinder'
                value={formData.rightEye.cylinder}
                onChange={(e) =>
                  handleEyeChange("rightEye", "cylinder", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
              <input
                type='text'
                placeholder='Axis'
                value={formData.rightEye.axis}
                onChange={(e) =>
                  handleEyeChange("rightEye", "axis", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </div>
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Left Eye</h3>
            <div className='mt-2 space-y-2'>
              <input
                type='text'
                placeholder='Sphere'
                value={formData.leftEye.sphere}
                onChange={(e) =>
                  handleEyeChange("leftEye", "sphere", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
              <input
                type='text'
                placeholder='Cylinder'
                value={formData.leftEye.cylinder}
                onChange={(e) =>
                  handleEyeChange("leftEye", "cylinder", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
              <input
                type='text'
                placeholder='Axis'
                value={formData.leftEye.axis}
                onChange={(e) =>
                  handleEyeChange("leftEye", "axis", e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='pdDistance'
              className='block text-sm font-medium text-gray-700'
            >
              PD Distance
            </label>
            <input
              type='text'
              id='pdDistance'
              name='pdDistance'
              value={formData.pdDistance}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </div>
          <div>
            <label
              htmlFor='pdNear'
              className='block text-sm font-medium text-gray-700'
            >
              PD Near
            </label>
            <input
              type='text'
              id='pdNear'
              name='pdNear'
              value={formData.pdNear}
              onChange={handleChange}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </div>
        </div>
        <div>
          <label
            htmlFor='addPower'
            className='block text-sm font-medium text-gray-700'
          >
            Add Power
          </label>
          <input
            type='text'
            id='addPower'
            name='addPower'
            value={formData.addPower}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div>
          <label
            htmlFor='lensType'
            className='block text-sm font-medium text-gray-700'
          >
            Lens Type
          </label>
          <select
            id='lensType'
            name='lensType'
            value={formData.lensType}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          >
            <option value=''>Select lens type</option>
            <option value='Single Vision'>Single Vision</option>
            <option value='Bifocal'>Bifocal</option>
            <option value='Progressive'>Progressive</option>
          </select>
        </div>
        <div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            {prescriptionId ? "Update" : "Add"} Prescription
          </button>
        </div>
      </form>
    </div>
  );
}
