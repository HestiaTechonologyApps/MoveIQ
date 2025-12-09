import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Table, Button, Card, Modal } from "react-bootstrap";
import type { InvoiceDetailDto, InvoiceDetailUpdate, InvoiceMaster } from "../../types/Invoice.types";
import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import toast, { Toaster } from "react-hot-toast";
import InvoiceMasterService from "../../services/Invoice.services";
import { Trash2 } from "lucide-react";

const InvoiceEdit: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceMasterId } = useParams();
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailDto[]>([]);
  const [invoice, setInvoice] = useState<InvoiceMaster | null>(null);
  const [formData, setFormData] = useState<InvoiceMaster | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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
        console.log(response);

        if (response.isSucess && response.value) {
          const data = response.value;

          setFormData({
            ...data,
            //invoiceDate: new Date(data.invoiceDate).toISOString().split("T")[0],
             invoiceDate: new Date(data.createdOn).toISOString().split("T")[0], // FIXED DATE
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

  // DELETE TRIP FROM INVOICE
  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };
  const confirmDeleteTrip = () => {
    if (deleteIndex !== null) {
      const updated = invoiceDetails.filter((_, i) => i !== deleteIndex);
      setInvoiceDetails(updated);
      calculateTotalAmount(updated);
      toast.success("Trip removed from invoice");
      setShowDeleteModal(false);
      setDeleteIndex(null);
    }
  };
  // UPDATE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    try {

      // Convert InvoiceDetailDto[] to InvoiceDetailUpdate[]
      const invoiceDetailsForUpdate: InvoiceDetailUpdate[] = invoiceDetails.map(detail => ({
        invoiceDetailId: detail.invoiceDetailId,
        invoiceMasterId: formData.invoicemasterId || formData.invoiceMasterId || 0,
        tripOrderId: detail.tripOrderId,
        categoryId: detail.categoryId,
        ammount: detail.ammount,
        totalTax: detail.totalTax,
        discount: detail.discount,
        totalDiscount: detail.discount,
        invoiceMaster: [],
        invoiceDetailTaxes: [
          {
            invoiceDetailTaxId: 0,
            invoiceDetailId: 0,
            categoryTaxId: 0,
            categoryTaxPercentage: 0,
            taxAmount: 0
          }
        ]
      }));

      const payload = {
        invoiceMasterId: formData.invoicemasterId || formData.invoiceMasterId || 0,
        invoiceNum: formData.invoiceNum,
        financialYearId: formData.financialYearId,
        companyId: formData.companyId,
        customerId: formData.customerId,
        totalAmount: formData.totalAmount,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        createdOn: formData.createdOn,
        isDeleted: formData.isDeleted,
        isCompleted: formData.isCompleted,
        invoiceDetails: invoiceDetailsForUpdate,
      };

      const response = await InvoiceMasterService.updateInvoice(
        formData.invoicemasterId || formData.invoiceMasterId || 0,
        payload
      );
      console.log(response);

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
    setLoading(true);
    try {
      // Convert to UpdateInvoiceRequest format
      const invoiceDetailsForUpdate: InvoiceDetailUpdate[] = invoiceDetails.map(detail => ({
        invoiceDetailId: detail.invoiceDetailId,
        invoiceMasterId: invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        tripOrderId: detail.tripOrderId,
        categoryId: detail.categoryId,
        ammount: detail.ammount,
        totalTax: detail.totalTax,
        discount: detail.discount,
        totalDiscount: detail.discount,
        invoiceMaster: [],
        invoiceDetailTaxes: [
          {
            invoiceDetailTaxId: 0,
            invoiceDetailId: 0,
            categoryTaxId: 0,
            categoryTaxPercentage: 0,
            taxAmount: 0
          }
        ]
      }));
      const payload = {
        invoiceMasterId: invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        invoiceNum: invoice.invoiceNum,
        financialYearId: invoice.financialYearId,
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        totalAmount: invoice.totalAmount,
        invoiceDate: invoice.invoiceDate,
        createdOn: invoice.createdOn,
        isDeleted: false,
        isCompleted: true,
        invoiceDetails: invoiceDetailsForUpdate,
      };

      const res = await InvoiceMasterService.updateInvoice(
        invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        payload
      );

      if (res.isSucess) {
        toast.success("Invoice marked as completed!");
        setTimeout(() => navigate("/dashboard/invoice-management"), 800);
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
    setLoading(true);
    try {
      // Convert to UpdateInvoiceRequest format
      const invoiceDetailsForUpdate: InvoiceDetailUpdate[] = invoiceDetails.map(detail => ({
        invoiceDetailId: detail.invoiceDetailId,
        invoiceMasterId: invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        tripOrderId: detail.tripOrderId,
        categoryId: detail.categoryId,
        ammount: detail.ammount,
        totalTax: detail.totalTax,
        discount: detail.discount,
        totalDiscount: detail.discount,
        invoiceMaster: [],
        invoiceDetailTaxes: [
          {
            invoiceDetailTaxId: 0,
            invoiceDetailId: 0,
            categoryTaxId: 0,
            categoryTaxPercentage: 0,
            taxAmount: 0
          }
        ]
      }));

      const payload = {
        invoiceMasterId: invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        invoiceNum: invoice.invoiceNum,
        financialYearId: invoice.financialYearId,
        companyId: invoice.companyId,
        customerId: invoice.customerId,
        totalAmount: invoice.totalAmount,
        invoiceDate: invoice.invoiceDate,
        createdOn: invoice.createdOn,
        isDeleted: true,
        isCompleted: false,
        invoiceDetails: invoiceDetailsForUpdate,
      };
      const res = await InvoiceMasterService.updateInvoice(
        invoice.invoicemasterId || invoice.invoiceMasterId || 0,
        payload
      );

      if (res.isSucess) {
        toast.success("Invoice canceled!");
        setTimeout(() => navigate("/dashboard/invoice-management/pending-invoices"), 800);
      } else {
        toast.error(res.error || "Failed to update invoice");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
                  <Form.Control
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceDate: e.target.value })
                    }
                  />
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
                    <th>Action</th>
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

                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
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
      {/* ------------------ DELETE TRIP MODAL ------------------ */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this trip from the invoice?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteTrip}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
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
