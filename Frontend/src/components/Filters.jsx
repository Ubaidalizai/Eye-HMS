import Select from 'react-select';
import SelectInput from "../components/SelectInput.jsx";

export const Filters = ({
  categories,
  monthLabels,
  summaryType,
  selectedCategory,
  selectedMonth,
  selectedYear,
  setSelectedCategory,
  setSummaryType,
  setSelectedMonth,
  setSelectedYear,
}) => {
  // Generate year options from 2022 to current year
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2022; // Starting year for the application
    const years = [];

    for (let year = currentYear; year >= startYear; year--) {
      years.push({ value: year, label: year.toString() });
    }

    return years;
  };
  // Custom styles for React Select with color palette
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: '42px',
      minHeight: '42px',
      borderColor: state.isFocused ? '#2563eb' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
      borderRadius: '8px',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: '#2563eb',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 12px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '0 12px',
      color: '#2563eb',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#2563eb'
        : state.isFocused
        ? 'rgba(37, 99, 235, 0.1)'
        : null,
      color: state.isSelected ? 'white' : state.isFocused ? '#2563eb' : '#374151',
      fontSize: '0.875rem',
      padding: '10px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }),
  };

  // Find the selected category option
  const selectedCategoryOption =
    categories.find((option) => option.value === selectedCategory) || null;

  return (
    <div className='bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-md'>
      <div className='flex items-center mb-5'>
        <h2 className='text-lg font-medium text-gray-700 mb-4'>
          Filter Dashboard Data
        </h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div>
          <label
            htmlFor='category-filter'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Category
          </label>
          <Select
            inputId='category-filter'
            options={[{ value: '', label: 'All Categories' }, ...categories]}
            value={selectedCategoryOption}
            onChange={(option) =>
              setSelectedCategory(option ? option.value : '')
            }
            placeholder='Select a category'
            isClearable
            styles={customStyles}
            className='react-select-container'
            classNamePrefix='react-select'
            aria-label='Select category'
          />
        </div>
        <div>
          <label
            htmlFor='summary-type'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Time Period
          </label>
          <SelectInput
            id='summary-type'
            options={[
              { value: 'monthly', label: 'Monthly Summary' },
              { value: 'yearly', label: 'Yearly Summary' },
            ]}
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value)}
          />
        </div>
        {summaryType === 'monthly' && (
          <div>
            <label
              htmlFor='month-filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Month
            </label>
            <SelectInput
              id='month-filter'
              options={monthLabels.map((label, index) => ({
                value: index + 1,
                label,
              }))}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        )}
        {/* Always show Year filter for both yearly and monthly views */}
        <div>
          <label
            htmlFor='year-filter'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Year
          </label>
          <SelectInput
            id='year-filter'
            options={generateYearOptions()}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  );
};

