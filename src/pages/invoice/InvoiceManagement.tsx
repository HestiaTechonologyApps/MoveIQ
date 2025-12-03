import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KiduLoader from "../../components/KiduLoader";
import { useYear } from "../../context/YearContext";
import InvoiceMasterService from "../../services/Invoice.services";
import KiduCard from "../../components/KiduCard";

interface CardData {
    title: string;
    value: number;
    change: number;
    color: string;
    route: string;
}

const InvoiceManagement: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { selectedYear } = useYear();
    // --------------------- FETCH DASHBOARD ---------------------
    useEffect(() => {
        const fetchCardData = async () => {
            try {
                setLoading(true);
                const response = await InvoiceMasterService.getInvoiceDashboard(selectedYear);
                console.log(response);

                if (response) {
                    setCards(
                        response.value.map((c) => ({
                            title: c.title ?? "",
                            value: c.value ?? 0,
                            change: c.change ?? 0,
                            color: c.color ?? "#000",
                            route: c.route ?? "/",
                        }))
                    );
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

    return (
        <>
            <div className="d-flex flex-column p-3 mt-5 mt-md-2">
                <h6 className="fw-bold mb-1 text-start head-font mt-3" style={{ color: "black", fontSize: "28px" }}>
                    Invoice Management
                </h6>
                <p className="fw-medium mb-1 text-start head-font" style={{ color: "gray" }}>You can manage your invoices here...</p>
                {/* Cards */}
                <Container fluid className="mt-3 px-3">
                    <Row className="g-2 justify-content-start mb-2 px-2">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center w-100 mt-3">
                                <KiduLoader type="..." />
                            </div>
                        ) : (
                            cards.map((card, idx) => (
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} key={idx} className="d-flex">
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
                </Container>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default InvoiceManagement;