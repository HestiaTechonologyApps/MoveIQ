import React, { useEffect, useRef, useState } from "react";
import { Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import type { Trip } from "../../types/Trip.types";
import TripService from "../../services/Trip.services";
import Attachments from "../../components/KiduAttachments";
import AuditTrailsComponent from "../../components/KiduAuditLogs";
import KiduLoader from "../../components/KiduLoader";
import TripStatusBadge from "./TripStatusBadge";
import { FaArrowLeft } from "react-icons/fa6";
import type { KiduPaymentAccordionRef } from "../../components/KiduPaymentAccordion";
import type { KiduKilometerAccordionRef } from "../../components/KiduKilometerAccordion";
import KiduPaymentAccordion from "../../components/KiduPaymentAccordion";
import KiduKmAccordion from "../../components/KiduKilometerAccordion";
import KiduCommentAccordion from "../../components/KiduCommentAccordion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TripActionPanel from "./TripActionPanel";

const TripView: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const paymentAccordionRef = useRef<KiduPaymentAccordionRef>(null);
  const kmAccordionRef = useRef<KiduKilometerAccordionRef>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripStatus, setTripStatus] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const recordId = Number(tripId);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const res = await TripService.getById(Number(tripId));
        console.log(res);
        if (res.isSucess && res.value) {
          setData(res.value);
          setTripStatus(res.value.tripStatus || "");
        } else {
          toast.error("Trip not found.");
        }
      } catch {
        toast.error("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [tripId]);

  const handlePrint = async () => {
    if (!printRef.current) return;
    const element = printRef.current;
    // Temporarily make the card full-width for capture
    const originalStyles = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      transform: element.style.transform,
      backgroundColor: element.style.backgroundColor,
    };
    element.style.width = "210mm"; // A4 width
    element.style.maxWidth = "none";
    element.style.backgroundColor = "#fff"; // ensure white background
    element.style.transform = "scale(1)";
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // clearer text
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1920, // force wide capture
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      console.log(pageHeight);
      // Calculate image dimensions to fit page
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // Add image (auto-scale height)
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${data?.tripOrderId || "TripDetails"}.pdf`);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      // Restore original styles
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.backgroundColor = originalStyles.backgroundColor;
      element.style.transform = originalStyles.transform;
    }
  };

  if (loading) return <KiduLoader type="trip details..." />;
  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No trip details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <div className="shadow-lg py-2 px-3 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>

        {/* Header */}
        <div className="d-flex justify-content-between w-100 align-items-center mb-1 px-2 rounded " style={{
          backgroundColor: "#18575A",
          fontSize: "1rem",
          height: "60px",
        }}>
          <div className="d-flex align-items-center">
            <Button
              size="sm"
              variant="link"
              onClick={() => navigate(-1)}
              className="me-3"
              style={{ backgroundColor: "white", padding: "0.2rem 0.5rem", textDecoration: "none", color: "#18575A" }}
            >
              <FaArrowLeft className="fw-bold" size={18} />
            </Button>
            <h5 className="fw-bold m-0 ms-1 text-white">Trip Details</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            {/* Trip Status Badge */}
            <TripStatusBadge status={tripStatus} />
            <TripActionPanel
              trip={{ tripOrderId: recordId, tripStatus }}
              currentStatus={tripStatus}
              onStatusUpdate={(status, remarks) => {
                setTripStatus(status);
                if (remarks) setData((prev: any) => ({ ...prev, details: `${prev.details}\n${remarks}` }));
              }}
              onKmUpdate={() => setRefreshKey(prev => prev + 1)}
              onPaymentUpdate={() => setRefreshKey(prev => prev + 1)}
            />
            {/* Print Button */}
            <Button
              onClick={handlePrint}
              className="d-flex align-items-center gap-2 text-danger fs-5"
              style={{ fontWeight: 500, fontSize: "15px", backgroundColor: "#18575A", border: "none" }}
            >
              <FaPrint />
            </Button>
          </div>
        </div>
        <div ref={printRef} style={{ padding: "1.5rem" }}>
          <Row className="gy-3 ps-4">
            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Trip ID</div>
              <div className="text-danger" style={{ fontSize: "0.85rem" }}>{data.tripOrderId}</div>
            </Col>

            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Customer Name</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.customerName}</div>
            </Col>
            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Customer Department</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.departmentName}</div>
            </Col>

            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Driver</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.driverName}</div>
            </Col>

            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Received Via</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.tripBookingModeName}</div>
            </Col>

            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Start Date & Time</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {data.fromDateString || "-"}
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>End Date & Time</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {data.toDateString || "-"}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="fw-semibold" style={{ fontSize: "1rem" }}>Vehicle Take-Off Time</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {data.vehicleTakeOfTimeString || "-"}
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <div className="fw-semibold" style={{ fontSize: "1rem" }}>Pickup From</div>
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.fromLocation}</div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div>
                <div className="fw-semibold" style={{ fontSize: "1rem" }}>Drop Locations</div>
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {data.toLocation1} , {data.toLocation2} , {data.toLocation3} , {data.toLocation4}
                </div>
              </div>
              {/* )} */}
            </Col>

            {data.paymentMode && data.paymentMode.trim() !== "" && (
              <Col xs={12} md={4}>
                <div className="fw-semibold" style={{ fontSize: "1rem" }}>Payment Mode</div>
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>{data.paymentMode}</div>
              </Col>
            )}

            {data.paymentDetails && data.paymentDetails.trim() !== "" && (
              <Col xs={12} md={4}>
                <div className="fw-semibold" style={{ fontSize: "1rem" }}>Payment Details</div>
                <div className="text-muted" style={{
                    fontSize: "0.85rem",
                    backgroundColor: "transparent",
                    whiteSpace: "pre-wrap",      // 👈 Wrap multi-line text
                    wordBreak: "break-word",     // 👈 Break long words
                    overflowWrap: "break-word",  // 👈 Extra safety for wrapping
                  }}>{data.paymentDetails}</div>
              </Col>
            )}

            {data.tripDetails && data.tripDetails.trim() !== "" && (
              <Col xs={12} md={5} className="mt-3">
                <div className="fw-semibold mb-1" style={{ fontSize: "1rem" }}>Other Trip Details</div>
                <div className="text-muted"
                  style={{
                    fontSize: "0.85rem",
                    backgroundColor: "transparent",
                    whiteSpace: "pre-wrap",      // 👈 Wrap multi-line text
                    wordBreak: "break-word",     // 👈 Break long words
                    overflowWrap: "break-word",  // 👈 Extra safety for wrapping
                  }}>
                  {data.tripDetails}
                </div>
              </Col>
            )}
          </Row>
        </div>
        <KiduCommentAccordion
          tableName="Trip"
          recordId={data.tripOrderId}
        />
        {/* Payment Details Accordion */}
        <KiduPaymentAccordion
          key={`payment-${refreshKey}`}
          ref={paymentAccordionRef}
          relatedEntityId={Number(data.tripOrderId)}
          relatedEntityType="Trip"
          heading="Payment Details"
        />
        {/* Kilometer Details Accordion */}
        <KiduKmAccordion
          key={`km-${refreshKey}`}
          ref={kmAccordionRef}
          tripId={Number(data.tripOrderId)}
        // driverId={data.driverId}
        />
        {/* Attachments + Audits */}
        <Attachments tableName="TRIPORDER" recordId={data.tripOrderId} />

        <AuditTrailsComponent tableName="TRIPORDER" recordId={data.tripOrderId} />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default TripView;

