import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Table, Button, Card, Modal } from "react-bootstrap";
import type { InvoiceDetailDto, InvoiceMaster } from "../../types/Invoice.types";
import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import toast, { Toaster } from "react-hot-toast";
import InvoiceMasterService from "../../services/Invoice.services";

const InvoiceEdit: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceMasterId } = useParams();
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailDto[]>([]);
  const [invoice, setInvoice] = useState<InvoiceMaster | null>(null);
  const [formData, setFormData] = useState<InvoiceMaster | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // LOAD INVOICE BY ID
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceMasterId) {
        toast.error("Invalid Invoice ID");
        navigate(-1);
        return;
      }
      setLoading(true);
      try {
        const response = await InvoiceMasterService.getInvoiceById(Number(invoiceMasterId));
        if (response.isSucess && response.value) {
          const data = response.value;

          setFormData({
            ...data,
            invoiceDate: new Date(data.invoiceDate).toISOString().split("T")[0],
          });
          setInvoice(data);
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
  // HANDLE TABLE EDIT
  const handleDetailChange = (
    index: number,
    field: keyof InvoiceDetailDto,
    value: any
  ) => {
    const updated = [...invoiceDetails];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setInvoiceDetails(updated);
    calculateTotalAmount(updated);
  };

  const calculateTotalAmount = (details: InvoiceDetailDto[]) => {
    const total = details.reduce(
      (sum, d) => sum + (d.ammount + d.totalTax - d.discount),
      0
    );

    setFormData((prev: any) => ({ ...prev, totalAmount: total }));
  };

  // UPDATE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        invoiceDetailDtos: invoiceDetails,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
      };

      const response = await InvoiceMasterService.updateInvoice(
        formData.invoicemasterId,
        payload
      );

      if (response.isSucess) {
        toast.success("Invoice updated successfully!");
        setTimeout(() => navigate("/dashboard/invoice-management"), 800);
      } else {
        toast.error(response.error || "Failed to update invoice");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
  if (loading || !formData) return <KiduLoader type="invoice..." />;

  return (
    <Container fluid className="py-3 mt-4">
      {/* Header */}
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h4 className="mb-0 fw-bold ms-2" style={{ fontFamily: "Urbanist" }}>
              Edit Invoice
            </h4>
          </div>

          <div>
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
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        {/* ------------------ READONLY INVOICE INFO ------------------ */}
        <Card className="mb-4 shadow-sm">
          <Card.Header style={{ backgroundColor: "#18575A", color: "white" }}>
            <h5 className="mb-0" style={{ fontFamily: "Urbanist" }}>
              Invoice Information
            </h5>
          </Card.Header>

          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Number</Form.Label>
                  <Form.Control type="text" value={formData.invoiceNum} readOnly />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Date</Form.Label>
                  <Form.Control type="text" value={formData.createdOnString} readOnly />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control type="text" value={formData.customerName} readOnly />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control type="text" value={formData.companyName} readOnly />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ------------------ EDITABLE TABLE ------------------ */}
        <Card className="mb-4 shadow-sm">
          <Card.Header style={{ backgroundColor: "#fff" }}>
            <h5 className="mb-0 fw-bold" style={{ color: "#18575A" }}>
              Invoice Details
            </h5>
          </Card.Header>

          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-light">
                  <tr className="text-center">
                    <th>Trip Order ID</th>
                    <th>Trip Code</th>
                    <th>Amount</th>
                    <th>Total Tax</th>
                    <th>Discount</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {invoiceDetails.map((detail, index) => {
                    const net = detail.ammount + detail.totalTax - detail.discount;
                    return (
                      <tr key={index}>
                        <td>{detail.tripOrderId}</td>
                        <td>{detail.tripOrderId}</td>
                        <td>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={detail.ammount}
                            onChange={(e) =>
                              handleDetailChange(index, "ammount", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={detail.totalTax}
                            onChange={(e) =>
                              handleDetailChange(index, "totalTax", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={detail.discount}
                            onChange={(e) =>
                              handleDetailChange(index, "discount", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <strong>{net.toFixed(2)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Col md={2} className="ms-auto">
                <Form.Group>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control type="number" readOnly value={formData.totalAmount.toFixed(2)} />
                </Form.Group>
              </Col>
            </div>
          </Card.Body>
        </Card>

        {/* ------------------ BUTTONS ------------------ */}
        <Row>
          <Col className="text-end">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
              className="me-2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              style={{ backgroundColor: "#18575A", border: "none" }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Invoice"}
            </Button>
          </Col>
        </Row>
      </Form>
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

export default InvoiceEdit;
