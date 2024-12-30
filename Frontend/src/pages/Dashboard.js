import React, { useState, useMemo } from "react";
import useFetchData from "../components/useFetchData";
import BarChart from "../components/BarChart";
import DoughnutChart from "../components/DoughnutChart";
import Filters from "../components/Filters";
import SummaryCard from "../components/SummaryCard";
import MoveHistory from "./MoveHistory";

const API_BASE_URL = "http://localhost:4000/api/v1";

const categories = ["drug", "sunglasses", "glass", "frame"];
const models = ["sales", "purchase", "income"];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Dashboard() {
  const [summaryType, setSummaryType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("sales");

  const dashboardSummary = useFetchData(
    `${API_BASE_URL}/dashboard/summary`,
    []
  );
  const stats = useFetchData(
    summaryType === "monthly"
      ? `${API_BASE_URL}/${selectedModel}/${selectedYear}/${selectedMonth}?category=${selectedCategory}`
      : `${API_BASE_URL}/${selectedModel}/${selectedYear}/?category=${selectedCategory}`,
    [selectedCategory, selectedMonth, selectedYear, summaryType, selectedModel]
  );

  const getBarChartData = useMemo(() => {
    const labels =
      summaryType === "yearly"
        ? monthLabels
        : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const data =
      stats?.data || Array(summaryType === "yearly" ? 12 : 30).fill(0);

    return {
      labels,
      datasets: [
        {
          label: selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1),
          data,
          backgroundColor: "rgb(0, 179, 255)",
          borderColor: "rgb(0, 179, 255)",
          borderWidth: 1,
        },
      ],
    };
  }, [stats, summaryType, selectedModel]);

  const getDoughnutChartData = useMemo(() => {
    const data = categories.map((category) =>
      (stats?.data || [])
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
    );

    return {
      labels: categories,
      datasets: [
        {
          data,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    };
  }, [stats, categories]);

  return (
    <>
      <div className='grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-5'>
        {dashboardSummary && (
          <>
            <SummaryCard
              title='Total Sales'
              value={dashboardSummary.totalSales}
              trend={67.81}
              trendDirection='up'
            />
            <SummaryCard
              title='Purchase'
              value={dashboardSummary.totalPurchases}
              trend={67.81}
              trendDirection='down'
            />
            <SummaryCard
              title='Total Products'
              value={dashboardSummary.totalProductsCount}
              trend={67.81}
              trendDirection='down'
            />
            <SummaryCard
              title='Total Expense'
              value={dashboardSummary.totalExpenses}
              trend={67.81}
              trendDirection='down'
            />
            <SummaryCard
              title='Total Net Income'
              value={dashboardSummary.totalIncome}
              trend={67.81}
              trendDirection='down'
            />
          </>
        )}
      </div>

<<<<<<< HEAD
      <Filters
        categories={categories}
        models={models}
        monthLabels={monthLabels}
        summaryType={summaryType}
        selectedCategory={selectedCategory}
        selectedModel={selectedModel}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedCategory={setSelectedCategory}
        setSelectedModel={setSelectedModel}
        setSummaryType={setSummaryType}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
      />
=======
      <div className=' flex flex-col gap-4'>
        <div className='flex mt-10 justify-between flex-wrap gap-4'>
          <SelectInput
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={selectedCategory}
            onChange={handleInputChange(setSelectedCategory)}
          />
          <SelectInput
            options={models.map((m) => ({
              value: m,
              label: m.charAt(0).toUpperCase() + m.slice(1),
            }))}
            value={selectedModel}
            onChange={handleInputChange(setSelectedModel)}
          />
          <SelectInput
            options={[
              { value: 'monthly', label: 'Monthly Summary' },
              { value: 'yearly', label: 'Yearly Summary' },
            ]}
            value={summaryType}
            onChange={handleInputChange(setSummaryType)}
          />
          {summaryType === 'monthly' && (
            <SelectInput
              options={monthLabels.map((label, index) => ({
                value: index + 1,
                label,
              }))}
              value={selectedMonth}
              onChange={handleInputChange(setSelectedMonth)}
            />
          )}
          {summaryType === 'yearly' && (
            <input
              className='w-52 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='number'
              value={selectedYear}
              onChange={handleInputChange(setSelectedYear)}
              min='2000'
              max={new Date().getFullYear()}
            />
          )}
        </div>
>>>>>>> 2acda12d8d5bf971c334fdf8e8430b7443e1192f

      <BarChart
        data={getBarChartData}
        title={`${summaryType} Summary for ${selectedModel}`}
      />
      <DoughnutChart
        data={getDoughnutChartData}
        title={`${selectedModel} by Category`}
      />

      <MoveHistory />
    </>
  );
}

export default Dashboard;
