import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import VehicleService from "../../../services/vehicle/Vehicles.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import Attachments from "../../../components/KiduAttachments";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import KiduPaymentAccordion from "../../../components/KiduPaymentAccordion";

const VehicleView: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const recordId = Number(vehicleId);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await VehicleService.getById(Number(vehicleId));
        if (res.isSucess && res.value) setData(res.value);
        else toast.error("Vehicle not found.");
      } catch {
        toast.error("Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vehicleId]);

  if (loading) return <KiduLoader type="vehicle details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No vehicle details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const fields = [
    { key: "registrationNumber", label: "Registration Number" },
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    { key: "chassisNumber", label: "Chassis Number" },
    { key: "engineNumber", label: "Engine Number" },
    { key: "vehicleType", label: "Vehicle Type" },
    { key: "registrationExpiryString", label: "Registration Expiry" },
    { key: "insuranceExpiryString", label: "Insurance Expiry" },
    { key: "currentStatus", label: "Current Status" },
    { key: "location", label: "Location" }
  ];

  const handleEdit = () =>
    navigate(`/dashboard/vehicle/edit-vehicle/${data.vehicleId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await VehicleService.delete(data.vehicleId);
      toast.success("Vehicle deleted successfully");
      setTimeout(() => navigate("/dashboard/vehicle/vehicle-list"), 800);
    } catch {
      toast.error("Failed to delete vehicle.");
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center mt-5"
      style={{ fontFamily: "Urbanist" }}
    >
      <Card
        className="shadow-lg p-4 w-100"
        style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>
              Vehicle Details
            </h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-1"
              style={{
                fontWeight: 500,
                backgroundColor: "#18575A",
                fontSize: "15px",
                border: "none",
              }}
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </Button>

            <Button
              variant="danger"
              className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500, fontSize: "15px" }}
              onClick={() => setShowConfirm(true)}
            >
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Title / ID */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">{data.registrationNumber}</h5>
          <p className="small mb-0 fw-bold text-danger">
            ID: {data.vehicleId}
          </p>
        </div>

        {/* Details Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0">
            <tbody>
              {fields.map(({ key, label }) => {
                let value = data[key];

                return (
                  <tr key={key}>
                    <td
                      style={{
                        width: "40%",
                        fontWeight: 600,
                        color: "#18575A",
                      }}
                    >
                      {label}
                    </td>
                    <td>{String(value || "-")}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Payment Accordion */}
        <KiduPaymentAccordion
          relatedEntityId={recordId}
          relatedEntityType="vehicle"
          heading="Payment Details"
        />
        {/* Attachments */}
        <Attachments tableName="vehicle" recordId={data.vehicleId} />
        {/* Audit Logs */}
        <AuditTrailsComponent tableName="vehicle" recordId={data.vehicleId} />
      </Card>

      {/* Delete Confirmation */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this vehicle?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default VehicleView;
