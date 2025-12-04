import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Table, Button, Card } from "react-bootstrap";
import type { InvoiceDetailDto, InvoiceMaster } from "../../types/Invoice.types";
import InvoiceMasterService from "../../services/Invoice.services";
import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import toast, { Toaster } from "react-hot-toast";

const InvoiceCreate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceData, customerId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailDto[]>([]);
  const [formData, setFormData] = useState<InvoiceMaster>({
    invoicemasterId: 0,
    invoiceNum: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    financialYearId: 0,
    companyId: 0,
    customerId: customerId || 0,
    companyName: "",
    customerName: "",
    totalAmount: 0,
    isCompleted: false,
    createdOn: new Date().toISOString(),
    createdBy: localStorage.getItem("username") || "User",
    isDeleted: false,
    invoiceDetailDtos: [],
  });

  useEffect(() => {
    if (invoiceData) {
      setFormData({
        ...invoiceData,
        invoiceDate: invoiceData.invoiceDate
          ? new Date(invoiceData.invoiceDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        createdBy: localStorage.getItem("username") || "User",
      });

      if (invoiceData.invoiceDetailDtos) {
        setInvoiceDetails(invoiceData.invoiceDetailDtos);
      }
    }
  }, [invoiceData]);

  const handleDetailChange = (
    index: number,
    field: keyof InvoiceDetailDto,
    value: any
  ) => {
    const updatedDetails = [...invoiceDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: parseFloat(value) || 0,
    };
    setInvoiceDetails(updatedDetails);
    calculateTotalAmount(updatedDetails);
  };

  const calculateTotalAmount = (details: InvoiceDetailDto[]) => {
    const total = details.reduce((sum, detail) => {
      const itemTotal = detail.ammount + detail.totalTax - detail.discount;
      return sum + itemTotal;
    }, 0);
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        invoiceDetailDtos: invoiceDetails,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
      };
      console.log("Submitting invoice:", payload);
      const response = await InvoiceMasterService.createInvoice(payload);
      console.log(response);
      
      if (response.isSucess) {
        toast.success("Invoice created successfully!");
       setTimeout(() => {
         navigate("/dashboard/invoice-management");
       }, 1000);
      } else {
        throw new Error(response.error || "Failed to create invoice");
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(`Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <KiduLoader type="invoice..." />;
  return (
    <Container fluid className="py-3 mt-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h4 className="mb-0 fw-bold ms-2" style={{ fontFamily: "Urbanist" }}>
              Create Invoice
            </h4>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
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
                  <Form.Label style={{ fontFamily: "Urbanist", fontWeight: 600 }}>
                    Invoice Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoiceNum}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceNum: e.target.value })
                    }
                    readOnly={!!invoiceData?.invoiceNum}
                    style={{ fontFamily: "Urbanist" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontFamily: "Urbanist", fontWeight: 600 }}>
                    Invoice Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceDate: e.target.value })
                    }
                    style={{ fontFamily: "Urbanist" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontFamily: "Urbanist", fontWeight: 600 }}>
                    Customer Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.customerName}
                    readOnly
                    style={{ fontFamily: "Urbanist", backgroundColor: "#f8f9fa" }}
                  />
                </Form.Group>
              </Col>
               <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontFamily: "Urbanist", fontWeight: 600 }}>
                    Company Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.companyName}
                    readOnly
                    style={{ fontFamily: "Urbanist", backgroundColor: "#f8f9fa" }}
                  />
                </Form.Group>
              </Col>

            </Row>

           
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm">
          <Card.Header style={{ backgroundColor: "#ffffffff", color: "white" }}>
            <h5 className="mb-0 fw-bold" style={{ fontFamily: "Urbanist", color:"#18575A" }}>
              Invoice Details
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-light" style={{ fontFamily: "Urbanist"}}>
                  <tr className="text-center">
                    <th>Trip Order ID</th>
                     <th>Trip Code</th>
                    <th>Amount</th>
                    <th>Total Tax</th>
                    <th>Discount</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "Urbanist", fontSize: 13 }}>
                  {invoiceDetails.map((detail, index) => {
                    const netAmount =
                      detail.ammount + detail.totalTax - detail.discount;
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
                            style={{ fontFamily: "Urbanist" }}
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
                            style={{ fontFamily: "Urbanist" }}
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
                            style={{ fontFamily: "Urbanist" }}
                          />
                        </td>
                        <td>
                          <strong>{netAmount.toFixed(2)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
               <Col md={2} className="ms-auto">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontFamily: "Urbanist", fontWeight: 600 }}>
                    Total Amount
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.totalAmount.toFixed(2)}
                    readOnly
                    style={{
                      fontFamily: "Urbanist",
                      backgroundColor: "#f8f9fa",
                      fontWeight: "bold",
                    }}
                  />
                </Form.Group>
              </Col>
            </div>
          </Card.Body>
        </Card>

        <Row>
          <Col className="text-end">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
              className="me-2"
              style={{ fontFamily: "Urbanist", width: 120 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#18575A",
                border: "none",
                fontFamily: "Urbanist",
                width: 150,
              }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </Col>
        </Row>
      </Form>
        <Toaster position="top-right" />
    </Container>
  );
};

export default InvoiceCreate;