import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import type {
  ExpenseCategoryData,
  MonthlyData,
} from "../types/dashboard/TripDashboard.types";

import DashboardService from "../services/dashboard/Dashboard.services";
import KiduLoader from "../components/KiduLoader";

// Colors
const PRIMARY_COLOR = "#007bff";
const SUCCESS_COLOR = "#28a745";
const DANGER_COLOR = "#dc3545";
const WARNING_COLOR = "#ffc107";

// Dummy Data (unchanged)
const dummyMonthlyData: MonthlyData[] = [
  { month: "Jan", expense: 55000, invoice: 75000 },
  { month: "Feb", expense: 58000, invoice: 82000 },
  { month: "Mar", expense: 62000, invoice: 90000 },
  { month: "Apr", expense: 59000, invoice: 85000 },
  { month: "May", expense: 65000, invoice: 95000 },
  { month: "Jun", expense: 68000, invoice: 99000 },
  { month: "Jul", expense: 69000, invoice: 102000 },
  { month: "Aug", expense: 66000, invoice: 98000 },
  { month: "Sep", expense: 60000, invoice: 90000 },
  { month: "Oct", expense: 63000, invoice: 92000 },
  { month: "Nov", expense: 70000, invoice: 105000 },
  { month: "Dec", expense: 75000, invoice: 110000 },
];

const dummyExpenseCategoryData: ExpenseCategoryData[] = [
  { category: "Fuel", amount: 25000, fill: DANGER_COLOR },
  { category: "Salaries", amount: 18000, fill: PRIMARY_COLOR },
  { category: "Scheduled Maint.", amount: 8000, fill: WARNING_COLOR },
  { category: "Tolls/Fees", amount: 5500, fill: "#17a2b8" },
  { category: "Insurance", amount: 4000, fill: "#6c757d" },
];

const FinancialCharts: React.FC = () => {
  const [monthlyFinancialData, setMonthlyFinancialData] = useState(dummyMonthlyData);
  const [expenseCategoryData, setExpenseCategoryData] = useState(dummyExpenseCategoryData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API Data (same logic as before)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const year = new Date().getFullYear();

        const summary = await DashboardService.getDashboardSummary(year);

        if (summary.isSucess && summary.value) {
          setMonthlyFinancialData(summary.value.monthlyFinancial || dummyMonthlyData);
          setExpenseCategoryData(summary.value.expenseCategories || dummyExpenseCategoryData);
        }
      } catch (err) {
        setError("Failed to load financial chart data, showing sample data.");
        setMonthlyFinancialData(dummyMonthlyData);
        setExpenseCategoryData(dummyExpenseCategoryData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <KiduLoader type="dashboard" />;

  const CHART_HEIGHT = "280px";
  const CHART_MARGIN = { top: 10, right: 10, left: 10, bottom: 5 };
  const yAxisFormatter = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  return (
    <div className="pt-2">
      {error && (
        <div className="alert alert-warning py-2 mb-3 text-center">{error}</div>
      )}

      <Row>
        {/* 1. Financial Trend */}
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0" style={{ height: CHART_HEIGHT }}>
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="fw-bold mb-0">💰 Financial Trend (Revenue vs Expense)</h6>
            </Card.Header>

            <Card.Body className="p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyFinancialData} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={yAxisFormatter} />
                  <Legend />
                  <Tooltip />
                  <Line type="monotone" dataKey="invoice" name="Revenue" stroke={SUCCESS_COLOR} dot={false} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke={DANGER_COLOR} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* 2. Monthly Financial Comparison */}
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0" style={{ height: CHART_HEIGHT }}>
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="fw-bold mb-0">📊 Monthly Financial Comparison</h6>
            </Card.Header>

            <Card.Body className="p-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFinancialData} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={yAxisFormatter} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expense" fill={DANGER_COLOR} name="Expense" />
                  <Bar dataKey="invoice" fill={SUCCESS_COLOR} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* 3. Top 5 Expense Categories */}
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0" style={{ height: CHART_HEIGHT }}>
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="fw-bold mb-0">💸 Top 5 Expense Categories</h6>
            </Card.Header>

            <Card.Body className="p-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseCategoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={yAxisFormatter} />
                  <YAxis type="category" dataKey="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="amount">
                    {expenseCategoryData.map((item, index) => (
                      <Cell key={index} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialCharts;
