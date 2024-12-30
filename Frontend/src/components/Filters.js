import React from "react";
import SelectInput from "../components/SelectInput";

const Filters = ({
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
}) => (
  <div className='flex justify-between flex-wrap gap-4'>
    <SelectInput
      options={[
        { value: "", label: "All Categories" },
        ...categories.map((c) => ({ value: c, label: c })),
      ]}
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    />
    <SelectInput
      options={models.map((m) => ({
        value: m,
        label: m.charAt(0).toUpperCase() + m.slice(1),
      }))}
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
    />
    <SelectInput
      options={[
        { value: "monthly", label: "Monthly Summary" },
        { value: "yearly", label: "Yearly Summary" },
      ]}
      value={summaryType}
      onChange={(e) => setSummaryType(e.target.value)}
    />
    {summaryType === "monthly" && (
      <SelectInput
        options={monthLabels.map((label, index) => ({
          value: index + 1,
          label,
        }))}
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />
    )}
    {summaryType === "yearly" && (
      <input
        className='w-52 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        type='number'
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        min='2000'
        max={new Date().getFullYear()}
      />
    )}
  </div>
);

export default Filters;
