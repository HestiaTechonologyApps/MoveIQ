import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { BsSearch } from "react-icons/bs";
import VehicleMaintenanceService from "../../../services/vehicle/Maintenance.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduValidation from "../../../components/KiduValidation";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import Attachments from "../../../components/KiduAttachments";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import VehiclePopUp from "../vehicles/VehiclePopUp";
import type { Vehicle } from "../../../types/vehicle/Vehicles.types";
import KiduPaymentAccordion from "../../../components/KiduPaymentAccordion";

const EditVehicleMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const { maintenanceId } = useParams();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleDisplayName, setVehicleDisplayName] = useState<string>("");
  console.log(selectedVehicle);

  const tableName = "VehicleMaintenanceRecord";
  const recordId = Number(maintenanceId);

  const fields = [
    { name: "vehicleId", rules: { required: true, type: "number", label: "Vehicle" } },
    { name: "maintenanceDate", rules: { required: true, type: "date", label: "Maintenance Date" } },
    { name: "maintenanceType", rules: { required: true, type: "text", label: "Maintenance Type" } },
    { name: "workshopName", rules: { required: true, type: "text", label: "Workshop Name" } },
    { name: "cost", rules: { required: true, type: "number", label: "Cost" } },
    { name: "odometerReading", rules: { required: true, type: "number", label: "Odometer Reading" } },
    { name: "performedBy", rules: { required: true, type: "text", label: "Performed By" } },
    { name: "description", rules: { required: false, type: "text", label: "Description" } },
    { name: "remarks", rules: { required: false, type: "text", label: "Remarks" } }
  ];

  useEffect(() => {
    const loadMaintenanceRecord = async () => {
      try {
        const res = await VehicleMaintenanceService.getById(Number(maintenanceId));
        if (res.isSucess && res.value) {
          const d = res.value;
          const loadedValues = {
            vehicleId: d.vehicleId || "",
            maintenanceDate: d.maintenanceDate ? d.maintenanceDate.split("T")[0] : "",
            maintenanceType: d.maintenanceType || "",
            workshopName: d.workshopName || "",
            cost: d.cost || "",
            odometerReading: d.odometerReading || "",
            performedBy: d.performedBy || "",
            description: d.description || "",
            remarks: d.remarks || "",
            createdBy: d.createdBy || "",
            createdDate: d.createdDate || ""
          };
          setFormData(loadedValues);
          setInitialValues(loadedValues);
          // Set vehicle display name from the API response
          if (d.vehicleName) {
            setVehicleDisplayName(d.vehicleName);
          }
          const errValues: any = {};
          fields.forEach(f => { errValues[f.name] = ""; });
          setErrors(errValues);
        } else {
          toast.error("Failed to load maintenance record");
          navigate("/dashboard/vehicle/maintenance-list");
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/dashboard/vehicle/maintenance-list");
      } finally {
        setLoading(false);
      }
    };
    loadMaintenanceRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceId, navigate]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const updated = type === "number" ? value.replace(/[^0-9.]/g, "") : value;
    setFormData((prev: any) => ({ ...prev, [name]: updated }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const rule = fields.find(f => f.name === name)?.rules;
    if (!rule) return true;
    const result = KiduValidation.validate(value, rule as any);
    setErrors((prev: any) => ({ ...prev, [name]: result.isValid ? "" : result.message }));
    return result.isValid;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => { if (!validateField(f.name, formData[f.name])) ok = false; });
    return ok;
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleDisplayName(`${vehicle.vehicleType} - ${vehicle.registrationNumber}`);
    setFormData((prev: any) => ({ ...prev, vehicleId: vehicle.vehicleId }));
    setShowVehiclePopup(false);
    if (errors.vehicleId) setErrors((prev: any) => ({ ...prev, vehicleId: "" }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;
    const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const payload = {
        ...formData,
        vehicleMaintenanceRecordId: Number(maintenanceId),
        createdBy: formData.createdBy,      // KEEP ORIGINAL
        createdDate: formData.createdDate,  // KEEP ORIGINAL IMPORTANT!
        updatedBy: loggedUser.userEmail || "User",
        updatedDate: new Date().toISOString()
      };

      const res = await VehicleMaintenanceService.update(Number(maintenanceId), payload);
      if (res.isSucess) {
        toast.success("Maintenance record updated successfully!");
        setTimeout(() => navigate("/dashboard/vehicle/maintenance-list"), 1500);
      } else {
        toast.error(res.customMessage || res.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <KiduLoader type="vehicle maintenance details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3"><KiduPrevious /></div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Edit Vehicle Maintenance</h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[0].rules.label} {fields[0].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  value={vehicleDisplayName}
                  placeholder="Select vehicle"
                  readOnly
                  onClick={() => setShowVehiclePopup(true)}
                  style={{ cursor: "pointer" }}
                />
                <Button
                  style={{ backgroundColor: "#18575A", border: "none" }}
                  onClick={() => setShowVehiclePopup(true)}
                >
                  <BsSearch />
                </Button>
              </div>
              {errors.vehicleId && <span className="text-danger">{errors.vehicleId}</span>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[1].rules.label} {fields[1].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="date"
                name="maintenanceDate"
                value={formData.maintenanceDate}
                onChange={handleChange}
                onBlur={() => validateField("maintenanceDate", formData.maintenanceDate)}
              />
              {errors.maintenanceDate && <small className="text-danger">{errors.maintenanceDate}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[2].rules.label} {fields[2].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="text"
                name="maintenanceType"
                placeholder="Enter maintenance type"
                maxLength={50}
                value={formData.maintenanceType}
                onChange={handleChange}
                onBlur={() => validateField("maintenanceType", formData.maintenanceType)}
              />
              {errors.maintenanceType && <small className="text-danger">{errors.maintenanceType}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[3].rules.label} {fields[3].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="text"
                name="workshopName"
                placeholder="Enter workshop name"
                maxLength={50}
                value={formData.workshopName}
                onChange={handleChange}
                onBlur={() => validateField("workshopName", formData.workshopName)}
              />
              {errors.workshopName && <small className="text-danger">{errors.workshopName}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[4].rules.label} {fields[4].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="number"
                name="cost"
                placeholder="Enter cost"
                value={formData.cost}
                onChange={handleChange}
                onBlur={() => validateField("cost", formData.cost)}
              />
              {errors.cost && <small className="text-danger">{errors.cost}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[5].rules.label} {fields[5].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="number"
                name="odometerReading"
                placeholder="Enter odometer reading"
                value={formData.odometerReading}
                onChange={handleChange}
                onBlur={() => validateField("odometerReading", formData.odometerReading)}
              />
              {errors.odometerReading && <small className="text-danger">{errors.odometerReading}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[6].rules.label} {fields[6].rules.required && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="text"
                name="performedBy"
                placeholder="Enter performed by"
                maxLength={30}
                value={formData.performedBy}
                onChange={handleChange}
                onBlur={() => validateField("performedBy", formData.performedBy)}
              />
              {errors.performedBy && <small className="text-danger">{errors.performedBy}</small>}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[7].rules.label}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter description"
                maxLength={150}
                value={formData.description}
                onChange={handleChange}
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[8].rules.label}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remarks"
                placeholder="Enter remarks"
                maxLength={150}
                value={formData.remarks}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>Update</Button>
          </div>

          <Row className="mb-2">
            <Col xs={12}>
              <KiduPaymentAccordion
                relatedEntityId={recordId}
                relatedEntityType="vehicleMaintenance"
                heading="Payment Details"
              />
              <Attachments tableName={tableName} recordId={recordId} />
            </Col>
          </Row>
          <div>
            <AuditTrailsComponent tableName={tableName} recordId={recordId} />
          </div>
        </Form>
      </Container>

      <VehiclePopUp
        show={showVehiclePopup}
        handleClose={() => setShowVehiclePopup(false)}
        onSelect={handleVehicleSelect}
      />

      <Toaster position="top-right" />
    </>
  );
};

export default EditVehicleMaintenance;