import { Button, Dropdown, Modal, Form, Row, Col, ButtonGroup } from "react-bootstrap";
import { FaFileInvoice, FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaCar, FaFilePdf } from "react-icons/fa6";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ExpenseMasterService from "../../services/Expense.services";
import TripService from "../../services/Trip.services";
import ConfirmCancelPopup from "./ActionPanel/ConfirmStatusModal";
import TripPaymentModal from "./ActionPanel/TripPaymentModal";
import KmModal from "./ActionPanel/KiloMeterModal";
import TripSheet from "./ActionPanel/TripSheet";
import InvoiceMaster from "./ActionPanel/InvoiceModal";
import InvoiceMasterService from "../../services/InvoiceMaster.services";

interface TripActionPanelProps {
    trip: any;
    onStatusUpdate?: (newStatus: string,
        remarks?: string) => void;
    currentStatus?: string;
    onKmUpdate?: () => void; // Add callback to refresh KM data
    onPaymentUpdate?: () => void;
}

const TripActionPanel: React.FC<TripActionPanelProps> = ({ trip, onStatusUpdate, currentStatus, onKmUpdate, onPaymentUpdate, }) => {

    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [confirmType, setConfirmType] = useState<string>("");
    console.log(selectedAction);

    // Invoice form state
    const [invoiceNum, setInvoiceNum] = useState("");
    const [financialYearId, setFinancialYearId] = useState<number>(1);
    const [companyId, setCompanyId] = useState<number>(1);
    const [totalAmount, setTotalAmount] = useState<number>(trip?.tripAmount || 0);
    const [createdOn, setCreatedOn] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [showTripSheet, setShowTripSheet] = useState(false);
    console.log(selectedAction);
    const [showKmModal, setShowKmModal] = useState(false); //  New state for KM modal

    const handleKmSuccess = () => {
        // Trigger refresh in the accordion
        if (onKmUpdate) {
            onKmUpdate();
        }
    };

    const handlePaymentSave = async (formData: any) => {
        try {
            const userName = localStorage.getItem("userName") || "Admin";
            const payload = {
                expenseMasterId: 0,
                expenseTypeId: formData.expenseTypeId,
                amount: formData.amount,
                expenseVoucher: formData.expenseVoucher || "",
                remark: formData.remark || "",
                paymentMode: formData.mode,
                relatedEntityId: trip?.tripOrderId,
                relatedEntityType: "Trip",
                createdOn: new Date().toISOString(),
                createdBy: userName,
                isActive: true,
                isDeleted: false,
            };

            console.log("Creating payment from TripActionPanel:", payload);

            const response = await ExpenseMasterService.create(payload);

            if (response.isSucess) {
                // toast.success("Payment details saved successfully!");
                setShowPaymentModal(false);

                // Trigger refresh in the payment accordion
                if (onPaymentUpdate) {
                    onPaymentUpdate();
                }
            } else {
                toast.error(response.customMessage || "Failed to save payment details");
            }
        } catch (error) {
            console.error("Error saving payment details:", error);
            toast.error("Failed to save payment details");
        }
    };

    useEffect(() => {
        if (trip) {
            setInvoiceNum(`INV-${trip.tripOrderId}`);
            setFinancialYearId(2025);
            setCompanyId(1);
        }
    }, [trip]);

    // Handle Dropdown Action
    const handleToolbarAction = (action: string) => {
        setSelectedAction(action);
        if (action === "Trip Cancel" || action === "Trip Completed") {
            setConfirmType(action);
            setShowCancelPopup(true);
        } else if (action === "Payment Details") {
            setShowPaymentModal(true);
        } else if (action === "Generate Invoice") {
            setShowInvoiceForm(true);
        } else if (action === "Update Kilometers") {
            setShowKmModal(true); // Open new KM modal
        } else if (action === "Generate Trip Sheet") {
            handleGenerateTripSheet();
        }
    };

    const formatDateForDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };
        return date.toLocaleDateString("en-GB", options).replace(",", "");
    };

    const handleConfirmAction = async (remarks: string) => {
        setShowCancelPopup(false);
        console.log("Remarks:", remarks);
        console.log("Current trip data:", trip);

        try {
            const updatedStatus = confirmType === "Trip Cancel" ? "Canceled" : "Completed";

            const payload = {
                tripOrderId: trip.tripOrderId,
                tripStatus: updatedStatus,
                remark: remarks
                    ? `${trip.tripDetails || trip.details || ""}\n\n[${new Date().toLocaleString()}] Status Update (${updatedStatus}): ${remarks}`.trim()
                    : trip.tripDetails || trip.details || "",
            }

            console.log("Payload being sent:", payload);

            const response = await TripService.updatestatus(payload);
            console.log("Update response:", response);
            if (response.isSucess) {
                toast.success(`Trip ${updatedStatus} successfully!`);
                // instantly update UI
                // eslint-disable-next-line react-hooks/immutability
                trip.tripStatus = updatedStatus;
                if (onStatusUpdate) {
                    onStatusUpdate(updatedStatus, remarks);
                }
                setTimeout(() => {
                    navigate('/dashboard/trip-list');
                }, 1000);
            } else {
                toast.error(response.customMessage || `Failed to update trip`);
            }
        } catch (error) {
            console.error("Error updating trip status:", error);
            toast.error("Something went wrong while updating status");
        }
    };

    const handleInvoiceSubmit = async () => {
        try {
            const formattedDate = new Date(createdOn).toISOString();
            const payload = {
                invoicemasterId: 0,
                invoiceNum,
                financialYearId,
                companyId,
                totalAmount,
                createdOn: formattedDate,
                isDeleted: false,
            };
            console.log("Payload being sent to InvoiceMaster API:", payload);

            const response = await InvoiceMasterService.create(payload);
            console.log("Invoice response:", response);
            if (response.isSucess) {
                toast.success("Invoice created successfully!");
                setInvoiceData({
                    ...response.value,
                    createdOnString: formatDateForDisplay(response.value.createdOn),
                });
                setShowInvoiceForm(false);
                setTimeout(() => setShowInvoice(true), 300);
            } else {
                toast.error(response.customMessage || "Failed to create invoice");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast.error("Something went wrong while creating invoice");
        }
    };

    const tripSheetRef = React.useRef<HTMLDivElement>(null);

    const handleGenerateTripSheet = async () => {
        try {
            // Show the trip sheet temporarily
            setShowTripSheet(true);
            // Wait for the component to render
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (!tripSheetRef.current) {
                console.error("Trip sheet ref not found!");
                toast.error("Unable to generate PDF");
                setShowTripSheet(false);
                return;
            }

            toast.success("Generating PDF...");

            const element = tripSheetRef.current;
            // Generate canvas with better settings
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            // Get image dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            // Create PDF
            const pdf = new jsPDF("p", "mm", "a4");
            // Convert canvas to JPEG instead of PNG (more reliable)
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
            // Download the PDF
            pdf.save(`TripSheet_${trip?.tripOrderId || "Trip"}.pdf`);
            toast.success("PDF generated successfully!");
            // Hide the trip sheet after generation
            setShowTripSheet(false);
        } catch (error) {
            console.error("Error generating Trip Sheet PDF:", error);
            toast.error("Failed to generate PDF");
            setShowTripSheet(false);
        }
    };

    return (
        <>
            <div
                className="d-flex justify-content-end align-items-center gap-2 mb-1"
                style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                }}
            >
                <Dropdown as={ButtonGroup}>
                    <Button
                        size="sm"
                        className="fw-semibold rounded-start"
                        style={{
                            backgroundColor: "#f8f9fa",
                            color: "#18575A",
                            border: "1px solid #18575A",
                            borderRadius: "2px",
                            fontSize: "0.7rem",
                        }}
                    >
                        <span className="head-font"> Manage Trip</span>
                    </Button>

                    <Dropdown.Toggle
                        split
                        variant="outline"
                        id="dropdown-split-basic"
                        size="sm"
                        style={{
                            borderColor: "#18575A",
                            backgroundColor: "#f8f9fa",
                            color: "#18575A",
                            fontWeight: 600,
                        }}
                    />

                    <Dropdown.Menu className="head-font">
                        <Dropdown.Item
                            onClick={() => handleToolbarAction("Trip Completed")}
                            disabled={
                                currentStatus === "Completed" || currentStatus === "Canceled"
                            }
                        >
                            <FaCheckCircle className="me-2 text-success" /> Trip Completed
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => handleToolbarAction("Trip Cancel")}
                            disabled={
                                currentStatus === "Completed" || currentStatus === "Canceled"
                            }

                        >
                            <FaTimesCircle className="me-2 text-danger" /> Trip Cancel
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleToolbarAction("Update Kilometers")}>
                            <FaCar className="me-2 text-info" /> Update Kilometers
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleToolbarAction("Payment Details")}>
                            <FaMoneyBillWave className="me-2 text-warning" /> Payment Details
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => handleToolbarAction("Generate Invoice")}>
                            <FaFileInvoice className="me-2 text-success" /> Generate Invoice
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => handleToolbarAction("Generate Trip Sheet")}>
                            <FaFilePdf className="me-2 text-danger" /> Generate Trip Sheet
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <KmModal
                show={showKmModal}
                onHide={() => setShowKmModal(false)}
                onSuccess={handleKmSuccess}
                tripId={trip?.tripOrderId}
                editId={null}
            />

            <ConfirmCancelPopup
                show={showCancelPopup}
                handleClose={() => setShowCancelPopup(false)}
                handleConfirm={handleConfirmAction}
                confirmType={confirmType}
            />

            <TripPaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                onSave={handlePaymentSave}
                relatedEntityId={trip?.tripOrderId}
                relatedEntityType="Trip"
                heading="Add Trip Payment Details"
                editData={null}
            />

            {/* Invoice Details form modal */}
            <Modal
                show={showInvoiceForm}
                onHide={() => setShowInvoiceForm(false)}
                centered
                backdrop="static"
            >
                <Modal.Header
                    closeButton
                    style={{ backgroundColor: "#18575A", color: "white" }}
                >
                    <Modal.Title className="fs-5">Add Invoice Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontFamily: "Urbanist" }}>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Amount</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Created On</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={createdOn}
                                        onChange={(e) => setCreatedOn(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInvoiceForm(false)}>
                        Cancel
                    </Button>
                    <Button
                        style={{ backgroundColor: "#18575A", border: "none" }}
                        onClick={handleInvoiceSubmit}
                    >
                        Save & Generate Invoice
                    </Button>
                </Modal.Footer>
            </Modal>

            <InvoiceMaster
                show={showInvoice}
                handleClose={() => setShowInvoice(false)}
                trip={{ ...trip, ...invoiceData }}
            />

            {/* Trip Sheet - conditionally render */}
            {showTripSheet && (
                <div style={{
                    position: "fixed",
                    left: "-9999px",
                    top: 0,
                    width: "210mm",
                    backgroundColor: "#ffffff"
                }}>
                    <TripSheet ref={tripSheetRef} trip={trip} />
                </div>
            )}

            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
};

export default TripActionPanel;