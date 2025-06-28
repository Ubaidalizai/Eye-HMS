import Select from 'react-select';
import SelectInput from "../components/SelectInput.jsx";

export const Filters = ({
  categories,
  models,
  monthLabels,
  summaryType,
  selectedCategory,
  selectedModel,
  selectedMonth,
  selectedYear,
  setSelectedCategory,
  setSelectedModel,
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
  // Custom styles for React Select to match the existing UI
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '40px',
      minHeight: '40px',
      borderColor: '#D1D5DB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9CA3AF',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 8px',
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
      padding: '0 8px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3B82F6'
        : state.isFocused
        ? '#EFF6FF'
        : null,
      color: state.isSelected ? 'white' : '#374151',
      fontSize: '0.875rem',
    }),
  };

  // Find the selected category option
  const selectedCategoryOption =
    categories.find((option) => option.value === selectedCategory) || null;

  return (
    <div className='bg-white p-4 sm:p-6 rounded-lg border shadow-sm'>
      <h2 className='text-lg font-medium text-gray-700 mb-4'>
        Filter Dashboard Data
      </h2>

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
            htmlFor='model-filter'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Data Type
          </label>
          <SelectInput
            id='model-filter'
            options={models.map((m) => ({
              value: m,
              label: m.charAt(0).toUpperCase() + m.slice(1),
            }))}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
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
