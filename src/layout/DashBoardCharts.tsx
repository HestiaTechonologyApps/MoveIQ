import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type {
  TripCountData,
  VehicleStatusData,
} from "../types/dashboard/TripDashboard.types";

import DashboardService from "../services/dashboard/Dashboard.services";
import KiduLoader from "../components/KiduLoader";

// Colors (same as original)
const PRIMARY_COLOR = "#007bff";
const SUCCESS_COLOR = "#28a745";
const DANGER_COLOR = "#dc3545";
const WARNING_COLOR = "#ffc107";

// Dummy Data (unchanged)
const dummyTripCountData: TripCountData[] = [
  { month: "Jan", trips: 450 },
  { month: "Feb", trips: 480 },
  { month: "Mar", trips: 520 },
  { month: "Apr", trips: 490 },
  { month: "May", trips: 550 },
  { month: "Jun", trips: 570 },
  { month: "Jul", trips: 600 },
  { month: "Aug", trips: 580 },
  { month: "Sep", trips: 530 },
  { month: "Oct", trips: 550 },
  { month: "Nov", trips: 620 },
  { month: "Dec", trips: 650 },
];

const dummyVehicleStatusData: VehicleStatusData[] = [
  { name: "In Trip", value: 45, color: PRIMARY_COLOR },
  { name: "Available", value: 105, color: SUCCESS_COLOR },
  { name: "In Maintenance", value: 10, color: DANGER_COLOR },
  { name: "Off-Road", value: 5, color: WARNING_COLOR },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent * 100 < 5) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "10px" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashBoardCharts: React.FC = () => {
  const [tripCountData, setTripCountData] = useState(dummyTripCountData);
  const [vehicleStatusData, setVehicleStatusData] =
    useState(dummyVehicleStatusData);

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
          const { monthlyTripCount, vehicleStatus } = summary.value;

          setTripCountData(
            monthlyTripCount?.length ? monthlyTripCount : dummyTripCountData
          );
          setVehicleStatusData(
            vehicleStatus?.length ? vehicleStatus : dummyVehicleStatusData
          );
        }
      } catch (err) {
        setError("Failed to load dashboard charts, showing sample data.");
        setTripCountData(dummyTripCountData);
        setVehicleStatusData(dummyVehicleStatusData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <KiduLoader type="dashboard" />;

  const CHART_HEIGHT = "280px";
  const CHART_MARGIN = { top: 10, right: 10, left: 10, bottom: 5 };

  return (
    <div className="pt-2">
      {error && (
        <div className="alert alert-warning py-2 mb-3 text-center">{error}</div>
      )}

      <Row>
        {/* Monthly Trip Count */}
        <Col xs={12} md={6} lg={6} className="mb-4">
          <Card className="shadow-sm border-0" style={{ height: CHART_HEIGHT }}>
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                🛣️ Monthly Trip Count
              </h6>
            </Card.Header>

            <Card.Body className="p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tripCountData} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="trips"
                    name="Total Trips"
                    stroke={WARNING_COLOR}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Vehicle Status Pie Chart */}
        <Col xs={12} md={6} lg={6} className="mb-4">
          <Card className="shadow-sm border-0" style={{ height: CHART_HEIGHT }}>
            <Card.Header className="bg-light p-3 border-bottom">
              <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                🚗 Vehicle Status Distribution
              </h6>
            </Card.Header>

            <Card.Body className="p-1 d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatusData as any}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{
                      fontSize: "0.75rem",
                      lineHeight: "18px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashBoardCharts;
