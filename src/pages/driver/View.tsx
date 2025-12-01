import React, { useEffect, useState } from "react";
import { Card, Table, Image, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import type { Driver } from "../../types/Driver.types";
import DriverService from "../../services/Driver.services";
import Attachments from "../../components/KiduAttachments";
import AuditTrailsComponent from "../../components/KiduAuditLogs";
import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import KiduPaymentAccordion from "../../components/KiduPaymentAccordion";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";
import defaultProfile from "../../assets/Images/profile.jpeg";
import KiduCommentAccordion from "../../components/KiduCommentAccordion";

const DriverView: React.FC = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();

  const [data, setData] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const recordId = Number(driverId);

  useEffect(() => {
    const loadDriver = async () => {
      try {
        const res = await DriverService.getById(Number(driverId));
        if (res.isSucess && res.value) {
          console.log("Driver loaded - profileImagePath:", res.value.profileImagePath);
          setData(res.value);
        } else {
          toast.error("Driver not found.");
        }
      } catch (err) {
        console.error("Error loading driver:", err);
        toast.error("Failed to load driver details.");
      } finally {
        setLoading(false);
      }
    };
    loadDriver();
  }, [driverId]);

  if (loading) return <KiduLoader type="driver details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No driver details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const fields = [
    { key: "dob", label: "Date of Birth" },
    { key: "license", label: "License Number" },
    { key: "nationality", label: "Nationality" },
    { key: "contactNumber", label: "Phone Number" },
    { key: "nationalId", label: "IQAMA Number" }
  ];

  const formatDate = (dob: string | null) => {
    if (!dob) return "";
    return new Date(dob).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const handleEdit = () => navigate(`/dashboard/driver-edit/${data.driverId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await DriverService.delete(data.driverId);
      toast.success("Driver deleted successfully");
      setTimeout(() => navigate("/dashboard/driver-list"), 800);
    } catch (err) {
      console.error("Error deleting driver:", err);
      toast.error("Failed to delete driver.");
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  // ✅ Get full image URL using helper function
  const imageUrl = data.profileImagePath ? getFullImageUrl(data.profileImagePath) : defaultProfile;
  console.log("Final image URL in view:", imageUrl);

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>Driver Details</h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-1"
              style={{ fontWeight: 500, backgroundColor: "#18575A", fontSize: "15px", border: "none" }}
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </Button>

            <Button variant="danger" className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500, fontSize: "15px" }}
              onClick={() => setShowConfirm(true)}>
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Driver Details Header with Image */}
        <div className="text-center mb-4">
          <Image
            src={imageUrl}
            alt={data.driverName}
            roundedCircle
            width={100}
            height={100}
            className="mb-3"
            style={{ border: "3px solid #18575A", objectFit: "cover" }}
            onError={(e: any) => {
              console.error("Image failed to load:", imageUrl);
              e.target.src = defaultProfile;
            }}
          />

          <h5 className="fw-bold mb-1">{data.driverName}</h5>
          <p className="small mb-0 fw-bold text-danger" style={{ color: "#18575A" }}>
            ID : {data.driverId}
          </p>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0">
            <tbody>
              {fields.map(({ key, label }) => {
                let value: any = (data as any)[key];
                if (key === "dob") value = formatDate(value);

                return (
                  <tr key={key}>
                    <td style={{ width: "40%", fontWeight: 600, color: "#18575A" }}>{label}</td>
                    <td>{String(value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        {/* Comments */}
        <KiduCommentAccordion
          tableName="Driver"
          recordId={recordId}
        />

        {/* Payment Accordion */}
        <KiduPaymentAccordion
          relatedEntityId={recordId}
          relatedEntityType="driver"
          heading="Payment Details"
        />

        {/* Attachments + Audits */}
        <Attachments tableName="Driver" recordId={data.driverId} />
        <AuditTrailsComponent tableName="Driver" recordId={data.driverId} />

      </Card>

      {/* Delete Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this driver?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loadingDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? (<><Spinner animation="border" size="sm" className="me-2" />Deleting...</>) : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default DriverView;