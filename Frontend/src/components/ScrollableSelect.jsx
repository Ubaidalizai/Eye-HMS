import { useState, useRef, useEffect } from 'react';

const ScrollableSelect = ({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  error = false,
  disabled = false,
  maxHeight = "200px"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleOptionClick = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      e.preventDefault();
      handleOptionClick(filteredOptions[0]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main select button */}
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full h-10 px-3 text-left border rounded focus:outline-none focus:ring transition
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          flex items-center justify-between
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Options list */}
          <div 
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                    ${value === option.value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'}
                    border-b border-gray-100 last:border-b-0
                  `}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollableSelect;
