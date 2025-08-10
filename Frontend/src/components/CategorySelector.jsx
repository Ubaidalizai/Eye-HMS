import { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../config';

const CategorySelector = ({
  value,
  onChange,
  type = null, // 'expense' or 'income' only
  placeholder = "Select a category",
  required = false,
  className = "",
  error = null
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  useEffect(() => {
    // Filter categories based on search term
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (category) => {
    onChange(category.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev =>
        prev < filteredCategories.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredCategories.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleOptionClick(filteredCategories[highlightedIndex]);
    } else if (e.key === 'Enter' && filteredCategories.length > 0 && highlightedIndex === -1) {
      e.preventDefault();
      handleOptionClick(filteredCategories[0]);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Use the unified categories endpoint with type query parameter
      let url = `${BASE_URL}/categories/active`;
      // If type is specified, use the main categories endpoint with type filter
      if (type && (type === 'expense' || type === 'income')) {
        url = `${BASE_URL}/categories?type=${type}&limit=100`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data.results || []);
      } else {
        console.error('Failed to fetch categories:', data.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.name === value);
  const displayValue = isOpen ? searchTerm : (selectedCategory ? selectedCategory.name : '');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`relative w-full`}>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Loading...' : placeholder}
          disabled={loading}
          required={required}
          className={`w-full p-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${loading ? 'bg-gray-100' : 'bg-white'}`}
          autoComplete="off"
        />

        {/* Clear button */}
        {value && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}

        {/* Dropdown arrow */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <div
                key={category._id}
                onClick={() => handleOptionClick(category)}
                className={`px-3 py-2 cursor-pointer ${
                  index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                } ${
                  value === category.name ? 'bg-blue-200 text-blue-900' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {category.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? 'No categories found' : 'No categories available'}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className='mt-1 text-xs text-red-600'>{error}</p>
      )}
    </div>
  );
};

export default CategorySelector;
