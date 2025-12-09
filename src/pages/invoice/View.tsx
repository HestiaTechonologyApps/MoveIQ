import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button, Modal } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import KiduPrevious from "../../components/KiduPrevious";
import KiduLoader from "../../components/KiduLoader";
import InvoiceMasterService from "../../services/Invoice.services";
import type { InvoiceDetailDto, InvoiceMaster } from "../../types/Invoice.types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaPrint } from "react-icons/fa6";

const InvoiceView: React.FC = () => {
    const { invoiceMasterId } = useParams();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null); // 👈 PRINT REF ADDED
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState<InvoiceMaster | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailDto[]>([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    // FETCH INVOICE BY ID
    useEffect(() => {
        const loadInvoice = async () => {
            const id = Number(invoiceMasterId);
            if (!id) {
                toast.error("Invalid Invoice ID");
                navigate(-1);
                return;
            }
            try {
                const response = await InvoiceMasterService.getInvoiceById(id);
                console.log(response);
                if (response.isSucess && response.value) {
                    const data = response.value;
                    setInvoice({
                        ...data,
                        invoiceDate: new Date(data.invoiceDate).toISOString().split("T")[0],
                    });

                    setInvoiceDetails(data.invoiceDetailDtos || []);
                } else {
                    toast.error("Failed to load invoice");
                }
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [invoiceMasterId, navigate]);

    // COMPLETE INVOICE
    const handleComplete = async () => {
        if (!invoice) return;

        try {
            const payload = {
                ...invoice,
                isCompleted: true,
                isDeleted: false,
            };

            const res = await InvoiceMasterService.updateInvoice(
                invoice.invoicemasterId,
                payload
            );

            if (res.isSucess) {
                toast.success("Invoice marked as completed!");
                navigate("/dashboard/invoice-management");
            } else {
                toast.error(res.error || "Failed to update invoice");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setShowCompleteModal(false);
        }
    };

    // CANCEL INVOICE
    const handleCancel = async () => {
        if (!invoice) return;

        try {
            const payload = {
                ...invoice,
                isCompleted: false,
                isDeleted: true,
            };

            const res = await InvoiceMasterService.updateInvoice(
                invoice.invoicemasterId,
                payload
            );

            if (res.isSucess) {
                toast.success("Invoice canceled!");
                navigate("/dashboard/invoice-management/pending-invoices");
            } else {
                toast.error(res.error || "Failed to update invoice");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setShowCancelModal(false);
        }
    };

    // ---------- PRINT INVOICE LIKE TRIP VIEW ----------
   const handlePrint = async () => {
  if (!printRef.current) return;

  const element = printRef.current;

  // Save original inline styles
  const originalStyles = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    backgroundColor: element.style.backgroundColor,
    padding: element.style.padding,
    filter: element.style.filter,
    fontSize: element.style.fontSize,
  };

  // ** GLOBAL OVERRIDE CSS for black & white **
  const bwStyle = document.createElement("style");
  bwStyle.id = "bw-print-style";
  bwStyle.innerHTML = `
    * {
      color: #000 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    table, th, td {
      border: 1px solid #000 !important;
    }

    thead tr {
      background: #fff !important;
    }

    tbody tr:nth-child(even) {
      background: #fff !important;
    }

    tbody tr:nth-child(odd) {
      background: #fff !important;
    }
  `;
  document.head.appendChild(bwStyle);

  // Temporary element print styles
  element.style.width = "210mm";
  element.style.maxWidth = "none";
  element.style.backgroundColor = "#ffffff";
  element.style.padding = "20px";
  element.style.fontSize = "12px";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`Invoice-${invoice?.invoiceNum || "Details"}.pdf`);
  } catch (err) {
    console.error("Print error:", err);
    toast.error("Failed to generate PDF");
  } finally {
    // Restore original styles
    element.style.width = originalStyles.width;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.backgroundColor = originalStyles.backgroundColor;
    element.style.padding = originalStyles.padding;
    element.style.filter = originalStyles.filter;
    element.style.fontSize = originalStyles.fontSize;

    // Remove BW override
    const existingStyle = document.getElementById("bw-print-style");
    if (existingStyle) existingStyle.remove();
  }
};



    if (loading || !invoice) return <KiduLoader type="invoice..." />;

    return (
        <Container fluid className="py-3 mt-4">
            {/* Header */}
            <Row className="mb-3">
                <Col className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <KiduPrevious />
                        <h4 className="mb-0 fw-bold ms-2" style={{ fontFamily: "Urbanist" }}>
                            View Invoice
                        </h4>
                    </div>

                    <div className="d-flex gap-2">
                        <Button
                            className="me-2"
                            style={{ backgroundColor: "#0e501d", border: "none" }}
                            onClick={() => setShowCompleteModal(true)}
                        >
                            Mark as Complete
                        </Button>

                        <Button
                            variant="danger"
                            onClick={() => setShowCancelModal(true)}
                        >
                            Cancel Invoice
                        </Button>
                        <Button
                            className="d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#f0ededff", border: "none" }}
                            onClick={handlePrint}
                        >
                            <FaPrint size={16} className="text-dark" />

                        </Button>
                    </div>
                </Col>
            </Row>

            {/* ------------------ INVOICE INFO ------------------ */}
            <div ref={printRef}>
                <Card className="mb-4 shadow-sm">
                    <Card.Header style={{ backgroundColor: "#18575A", color: "white" }}>
                        <h5 className="mb-0" style={{ fontFamily: "Urbanist" }}>
                            Invoice Information
                        </h5>
                    </Card.Header>

                    <Card.Body>
                        <Row>
                            <Col md={3}>
                                <p><strong>Invoice Number:</strong><br /> {invoice.invoiceNum}</p>
                            </Col>

                            <Col md={3}>
                                <p><strong>Invoice Date:</strong><br /> {invoice.createdOnString}</p>
                            </Col>

                            <Col md={3}>
                                <p><strong>Customer Name:</strong><br /> {invoice.customerName}</p>
                            </Col>

                            <Col md={3}>
                                <p><strong>Company Name:</strong><br /> {invoice.companyName}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* ------------------ INVOICE DETAILS ------------------ */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header style={{ backgroundColor: "#fff" }}>
                        <h5 className="mb-0 fw-bold" style={{ color: "#18575A" }}>
                            Invoice Details
                        </h5>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead className="table-light text-center">
                                    <tr>
                                        <th>Trip Order ID</th>
                                        <th>Trip Code</th>
                                        <th>Amount</th>
                                        <th>Total Tax</th>
                                        <th>Discount</th>
                                        <th>Net Amount</th>
                                    </tr>
                                </thead>

                                <tbody className="text-center">
                                    {invoiceDetails.map((d, index) => {
                                        const net = d.ammount + d.totalTax - d.discount;

                                        return (
                                            <tr key={index}>
                                                <td>{d.tripOrderId}</td>
                                                <td>{d.tripOrderId}</td>
                                                <td>{d.ammount}</td>
                                                <td>{d.totalTax}</td>
                                                <td>{d.discount}</td>
                                                <td><strong>{net.toFixed(2)}</strong></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>

                            <Col md={2} className="ms-auto">
                                <p><strong>Total Amount:</strong> {invoice.totalAmount?.toFixed(2)}</p>
                            </Col>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* ------------------ COMPLETE MODAL ------------------ */}
            <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mark Invoice Complete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to mark this invoice as <strong>Completed</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
                    <Button style={{ backgroundColor: "#0e501d", border: "none" }} onClick={handleComplete}>
                        Yes, Complete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ------------------ CANCEL MODAL ------------------ */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Invoice</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <strong>Cancel</strong> this invoice?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
                    <Button variant="danger" onClick={handleCancel}>
                        Yes, Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            <Toaster position="top-right" />
        </Container>
    );
};

export default InvoiceView;
