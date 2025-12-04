import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Charts from "../layout/Charts";
import TripService from "../services/Trip.services";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KiduLoader from "../components/KiduLoader";
import KiduCard from "../components/KiduCard";
import KiduButton from "../components/KiduButton";
import KiduSearchBar from "../components/KiduSearchBar";
import { useYear } from "../context/YearContext";

interface CardData {
  title: string;
  value: number;
  change: number;
  color: string;
  route: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { selectedYear } = useYear();

  // --------------------- FETCH DASHBOARD ---------------------
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await TripService.getTripDashboard(selectedYear);
        console.log(response);
        
        if (response?.isSuccess && response?.value) {
          setCards(response.value);
        } else {
          toast.error("Failed to load dashboard data.");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error fetching dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [selectedYear]);

  // --------------------- HANDLE SEARCH ---------------------
  const handleSearch = async (term: string) => {
    if (!term) {
      toast.error("Please enter a Trip ID to search.");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Searching for trip...");

    try {
      const tripId = Number(term);
      
      if (isNaN(tripId)) {
        toast.dismiss(loadingToast);
        toast.error("Please enter a valid Trip ID (numbers only).");
        return;
      }

      const response = await TripService.getById(tripId);

      toast.dismiss(loadingToast);

      if (response.isSucess && response.value) {
        const trip = response.value;
        toast.success(`Trip ${trip.tripOrderId} found!`);
        
        // Navigate to trip view page
        navigate(`/dashboard/trip-view/${trip.tripOrderId}`);
      } else {
        toast.error(response.error || "No trip found with this ID.");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Error fetching trip by ID:", error);
      
      if (error.message.includes("404")) {
        toast.error("Trip not found. Please check the Trip ID.");
      } else {
        toast.error("Error fetching trip details. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="d-flex flex-column p-3 mt-5 mt-md-2">

        {/* Search + Add Button */}
        <div className="d-flex justify-content-between flex-column flex-md-row align-items-stretch gap-2 mt-5">

          <KiduSearchBar 
            onSearch={handleSearch}
            placeholder="Search by Trip ID..."
          />

          <KiduButton
            label={
              <div className="d-flex align-items-center gap-2" style={{ textDecoration: "none" }}>
                <FaPlus className="fw-bold" />
                <span className="head-font mt-1">Add New Trip</span>
              </div>
            }
            to="/dashboard/trip-create"
            style={{ width: 200 }}
          />
        </div>

        {/* Cards */}
        <Container fluid className="mt-5 px-0">
          <Row className="g-2 justify-content-start mb-2">
            <h6 className="fw-medium mb-3 text-start head-font" style={{ color: "gray" }}>
              Overview
            </h6>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center w-100 mt-3">
                <KiduLoader type="..." />
              </div>
            ) : (
              cards.map((card, idx) => (
                <Col xs={6} sm={6} md={4} lg={3} xl={2} key={idx} className="d-flex">
                  <KiduCard
                    title={card.title}
                    value={card.value}
                    change={card.change}
                    color={card.color}
                    onClick={() => navigate(card.route)}
                  />
                </Col>
              ))
            )}
          </Row>

          <Charts />

        </Container>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default HomePage;