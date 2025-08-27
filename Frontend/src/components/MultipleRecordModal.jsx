import React from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const MultipleRecordModal = ({
  isOpen,
  onClose,
  fields,
  fieldValues,
  setFieldValues,
  typesData,
  selectedTypes,
  onTypeSelection,
  onSubmit,
  title = "Add Multiple Records"
}) => {
  if (!isOpen) return null;

  const handleTypeCheckboxChange = (typeId, e) => {
    onTypeSelection(typeId, e.target.checked);
  };

  const isTypeSelected = (typeId) => {
    return selectedTypes.includes(typeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Common Fields */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Common Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.filter(field => field.name !== 'type').map((field, index) => (
                <div key={index} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={fieldValues[field.name] || ''}
                      onChange={(e) => setFieldValues({
                        ...fieldValues,
                        [field.name]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option, idx) => (
                        <option key={idx} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={fieldValues[field.name] || ''}
                      onChange={(e) => setFieldValues({
                        ...fieldValues,
                        [field.name]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={`Enter ${field.label}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Select Types ({selectedTypes.length} selected)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
              {typesData.map((type) => (
                <label
                  key={type._id}
                  className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
                    isTypeSelected(type._id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isTypeSelected(type._id)}
                    onChange={(e) => handleTypeCheckboxChange(type._id, e)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500">Price: {type.price}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          {selectedTypes.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Selected Records:</span>
                  <span className="font-medium">{selectedTypes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">
                    {selectedTypes.reduce((total, typeId) => {
                      const type = typesData.find(t => t._id === typeId);
                      return total + (type?.price || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                {fieldValues.discount && parseFloat(fieldValues.discount) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Total Discount:</span>
                      <span className="font-medium text-red-600">-{parseFloat(fieldValues.discount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-300 pt-2">
                      <span className="font-semibold">Final Amount:</span>
                      <span className="font-semibold">
                        {(selectedTypes.reduce((total, typeId) => {
                          const type = typesData.find(t => t._id === typeId);
                          return total + (type?.price || 0);
                        }, 0) - parseFloat(fieldValues.discount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <strong>Note:</strong> The discount will be distributed proportionally across all selected records.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={selectedTypes.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedTypes.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            <FaPlus className="inline mr-2" />
            Create {selectedTypes.length} Record{selectedTypes.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultipleRecordModal;
