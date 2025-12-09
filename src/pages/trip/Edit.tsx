import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { BsSearch } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import TripService from "../../services/Trip.services";
import { KiduValidation } from "../../components/KiduValidation";
import KiduReset from "../../components/ReuseButtons/KiduReset";
import KiduDropLocation from "../../components/Trip/KiduDropLocation";
import CustomerPopup from "../customer/CustomerPopup";
import DriverPopup from "../driver/DriverPopup";
import KiduLoader from "../../components/KiduLoader";
import Attachments from "../../components/KiduAttachments";
import AuditTrailsComponent from "../../components/KiduAuditLogs";
import KiduPaymentAccordion from "../../components/KiduPaymentAccordion";
import KiduKilometerAccordion from "../../components/KiduKilometerAccordion";
import TripStatusBadge from "./TripStatusBadge";
import TripActionPanel from "./TripActionPanel";
import KiduCommentAccordion from "../../components/KiduCommentAccordion";
import CustomerDepartmentService from "../../services/CustomerDepartment.services";

const TripEdit: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);

  const fields = [
    { name: "customerName", rules: { required: true, type: "text" as const, label: "Customer Name" } },
    { name: "departmentName", rules: { required: true, type: "text" as const, label: "Customer Department" } },
    { name: "receivedVia", rules: { required: true, type: "select" as const, label: "Received Via" } },
    { name: "fromDate", rules: { required: true, type: "date" as const, label: "From Date" } },
    { name: "fromTime", rules: { required: true, type: "select" as const, label: "From Time" } },
    { name: "fromAmPm", rules: { required: true, type: "select" as const, label: "AM/PM" } },
    { name: "toDate", rules: { required: true, type: "date" as const, label: "To Date" } },
    { name: "toTime", rules: { required: true, type: "select" as const, label: "To Time" } },
    { name: "toAmPm", rules: { required: true, type: "select" as const, label: "AM/PM" } },
    { name: "pickupFrom", rules: { required: true, type: "text" as const, label: "Pickup From" } },
    { name: "vehicleTakeOfTime", rules: { required: true, type: "text" as const, label: "Vehicle Take-Off Date" } },
    { name: "takeOffTime", rules: { required: true, type: "text" as const, label: "Time" } },
    { name: "takeOffAmPm", rules: { required: true, type: "text" as const, label: "AM/PM" } },
    { name: "driverName", rules: { required: true, type: "text" as const, label: "Driver Name" } },
    { name: "dropLocations", rules: { required: true, type: "dropLocations" as const, label: "Drop Locations" } },
    { name: "paymentMode", rules: { required: true, type: "select" as const, label: "Payment Mode" } },
    { name: "paymentDetails", rules: { required: false, type: "text" as const, label: "Payment Details" } },
    { name: "details", rules: { required: false, type: "text" as const, label: "Trip Details" } }
  ];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    if (f.rules.type === "dropLocations") initialValues[f.name] = [""];
    else initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [originalData, setOriginalData] = useState(initialValues);
  const [tripStatus, setTripStatus] = useState("Scheduled");
  const [bookingModes, setBookingModes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number>();
  const [driverId, setDriverId] = useState<number>();
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tableName = "TRIPORDER";
  const recordId = Number(tripId);

  const timesList = (() => {
    const arr: string[] = [];
    for (let h = 1; h <= 12; h++) {
      for (let m = 0; m < 60; m += 15) {
        arr.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      }
    }
    return arr;
  })();

  const getLabel = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return "";
    return (
      <>
        {field.rules.label}
        {field.rules.required && <span style={{ color: "red", marginLeft: "2px" }}>*</span>}
      </>
    );
  };

  const convertFrom24 = (time24: string) => {
    if (!time24) return { time: "", ampm: "" };
    const [hour24, min] = time24.split(":");
    let hour = parseInt(hour24);
    const ampm = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return { time: `${hour.toString().padStart(2, "0")}:${min}`, ampm };
  };

  useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        const res = await TripService.getById(Number(tripId));

        if (res.isSucess && res.value) {
          const trip = res.value;

          const drops = [
            trip.toLocation1,
            trip.toLocation2,
            trip.toLocation3,
            trip.toLocation4
          ].filter(loc => loc && loc.trim() !== "");

          const fromDate = trip.fromDate ? trip.fromDate.split("T")[0] : "";
          const fromDateTime = trip.fromDate ? new Date(trip.fromDate) : null;
          const fromTimeStr = fromDateTime ? `${fromDateTime.getHours().toString().padStart(2, "0")}:${fromDateTime.getMinutes().toString().padStart(2, "0")}` : "";
          const fromParsed = convertFrom24(fromTimeStr);

          const toDate = trip.toDate ? trip.toDate.split("T")[0] : "";
          const toDateTime = trip.toDate ? new Date(trip.toDate) : null;
          const toTimeStr = toDateTime ? `${toDateTime.getHours().toString().padStart(2, "0")}:${toDateTime.getMinutes().toString().padStart(2, "0")}` : "";
          const toParsed = convertFrom24(toTimeStr);

          const vehicleTakeOfTime = trip.vehicleTakeOfTime ? trip.vehicleTakeOfTime.split("T")[0] : "";
          const takeOffTime = trip.vehicleTakeOfTime ? new Date(trip.vehicleTakeOfTime) : null;
          const toTimeString = takeOffTime ? `${takeOffTime.getHours().toString().padStart(2, "0")}:${takeOffTime.getMinutes().toString().padStart(2, "0")}` : "";
          const takeoffParsed = convertFrom24(toTimeString);

          const loadedData = {
            tripCode: trip.tripCode || "",
            customerName: trip.customerName || "",
            receivedVia: trip.tripBookingModeId?.toString() || "",
            fromDate,
            fromTime: fromParsed.time,
            fromAmPm: fromParsed.ampm,
            toDate,
            toTime: toParsed.time,
            toAmPm: toParsed.ampm,
            vehicleTakeOfTime,
            takeOffTime: takeoffParsed.time,
            takeOffAmPm: takeoffParsed.ampm,
            pickupFrom: trip.fromLocation || "",
            driverName: trip.driverName || "",
            dropLocations: drops.length > 0 ? drops : [""],
            paymentMode: trip.paymentMode || "",
            paymentDetails: trip.paymentDetails || "",
            details: trip.tripDetails || "",
            departmentName: trip.departmentName,
          };

          setFormData(loadedData);
          setOriginalData(loadedData);
          setCustomerId(trip.customerId);
          setDriverId(trip.driverId);
          setTripStatus(trip.tripStatus || "Scheduled");
        } else {
          toast.error("Failed to load trip data");
          navigate("/dashboard/trip-list");
        }
      } catch {
        toast.error("Error loading trip data");
        navigate("/dashboard/trip-list");
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [tripId, navigate]);

  useEffect(() => {
    const loadModes = async () => {
      try {
        const res = await TripService.getBookingMode();
        if (res.isSucess) setBookingModes(res.value);
      } catch {
        toast.error("Failed to load booking modes");
      }
    };
    const loadDepartments = async () => {
      try {
        const res = await CustomerDepartmentService.getAll(); // <-- your API
        console.log(res);

        if (res.isSucess) setDepartments(res.value);
      } catch {
        toast.error("Failed to load departments");
      }
    };
    loadModes();
    loadDepartments();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const overrideMessage = (name: string) => {
    const field = fields.find(f => f.name === name);
    const label = field?.rules.label || "This field";
    return `${label} is required.`;
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    const result = KiduValidation.validate(value, field.rules);
    if (!result.isValid) {
      const msg = overrideMessage(name);
      setErrors((prev: any) => ({ ...prev, [name]: msg }));
      return false;
    }
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  const convertTo24 = (time: string, ampm: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${m}`;
  };

  const handleDropChange = (values: string[]) => {
    setFormData((prev: any) => ({ ...prev, dropLocations: values }));
    validateField("dropLocations", values);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // SIMPLE DATE VALIDATION
    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.toDate) < new Date(formData.fromDate)) {
        toast.error("To Date cannot be before From Date");
        return;
      }
    }
    if (!validateForm()) return;
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!driverId) {
      toast.error("Please select a driver");
      return;
    }

    setIsSubmitting(true);

    try {
      const drops = formData.dropLocations.filter((d: string) => d.trim() !== "");
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        tripOrderId: Number(tripId),
        tripCode: formData.tripCode,
        tripBookingModeId: Number(formData.receivedVia),
        customerId,
        driverId,
        fromDate: `${formData.fromDate}T${convertTo24(formData.fromTime, formData.fromAmPm)}:00`,
        fromDateString: formData.fromDate,
        toDate: `${formData.toDate}T${convertTo24(formData.toTime, formData.toAmPm)}:00`,
        toDateString: formData.toDate,
        vehicleTakeOfTime: `${formData.vehicleTakeOfTime}T${convertTo24(formData.takeOffTime, formData.takeOffAmPm)}:00`,
        fromLocation: formData.pickupFrom,
        toLocation1: drops[0] || "",
        toLocation2: drops[1] || "",
        toLocation3: drops[2] || "",
        toLocation4: drops[3] || "",
        bookedBy: loggedUser.userEmail || "User",
        tripDetails: formData.details || "",
        tripStatus,
        tripAmount: formData.tripAmount,
        advanceAmount: formData.advanceAmount,
        balanceAmount: formData.balanceAmount,
        isActive: true,
        paymentMode: formData.paymentMode,
        paymentDetails: formData.paymentDetails || "",
        customerName: formData.customerName,
        driverName: formData.driverName,
        tripModeName: formData.tripModeName,
        departmentName: formData.departmentName,
      };

      const res = await TripService.update(Number(tripId), payload);

      if (res.isSucess) {
        toast.success("Trip updated successfully");
        setTimeout(() => navigate("/dashboard/trip-list"), 1000);
      } else {
        toast.error(res.customMessage || "Failed to update trip");
      }
    } catch {
      toast.error("Error updating trip");
    }

    setIsSubmitting(false);
  };

  if (isLoading) return <KiduLoader type="trips..." />;

  return (
    <>
      <Card className="mx-3" style={{ maxWidth: "100%", fontSize: "0.85rem", marginTop: "50px", backgroundColor: "#f0f0f0ff" }}>
        <Card.Header style={{ backgroundColor: "#18575A", color: "white", height: "65px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button size="sm" variant="link" className="me-2 mb-2" style={{ backgroundColor: "white", padding: "0.2rem 0.5rem", color: "#18575A" }} onClick={() => navigate(-1)}>
                <FaArrowLeft />
              </Button>
              <h6 className="mb-0 px-2 fw-medium fs-5 mb-2">Edit Booking</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <TripStatusBadge status={tripStatus} />
              <TripActionPanel
                trip={{ tripOrderId: recordId, tripStatus }}
                currentStatus={tripStatus}
                onStatusUpdate={(status, remarks) => {
                  setTripStatus(status);
                  if (remarks) setFormData((prev: any) => ({ ...prev, details: `${prev.details}\n${remarks}` }));
                }}
                onKmUpdate={() => setRefreshKey(prev => prev + 1)}
                onPaymentUpdate={() => setRefreshKey(prev => prev + 1)}
              />
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: "1rem" }}>
          <Form onSubmit={handleSubmit}>

            {/* CUSTOMER */}
            <Row className="mb-2 mx-3">
              <Col xs={2} md={1}>
                <Form.Group className="mb-1">
                  <Form.Label className="mb-1 fw-medium">Trip ID</Form.Label>
                  <Form.Control size="sm" type="text" readOnly value={formData.tripCode} className="custom-input w-100 text-danger fw-bold" />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Label className="mb-1 fw-medium">{getLabel("customerName")}</Form.Label>
                <InputGroup>
                  <Form.Control size="sm" type="text" readOnly placeholder="Enter customer name"
                    name="customerName" value={formData.customerName}
                    onChange={handleChange} onBlur={() => validateField("customerName", formData.customerName)} />
                  <Button size="sm" onClick={() => setShowCustomerPopup(true)} style={{ backgroundColor: "#18575A" }}>
                    <BsSearch />
                  </Button>
                </InputGroup>
                {errors.customerName && <div className="text-danger small">{errors.customerName}</div>}
              </Col>
              {/* Department */}
              <Col md={3}>
                <Form.Label className="mb-1 fw-medium">{getLabel("departmentName")}</Form.Label>
                <Form.Select
                  size="sm"
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={(e) => {
                    const selectedName = e.target.value;

                    setFormData((prev: any) => ({
                      ...prev,
                      departmentName: selectedName   // store NAME only
                    }));

                    if (errors.departmentName)
                      setErrors((p: any) => ({ ...p, departmentName: "" }));
                  }}
                  onBlur={() => validateField("departmentName", formData.departmentName)}
                >
                  <option value="">Select Department</option>

                  {departments.map(d => (
                    <option key={d.departmentId} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}

                </Form.Select>

                {errors.departmentName && <div className="text-danger small">{errors.departmentName}</div>}
              </Col>

              {/* Received via */}
              <Col md={3}>
                <Form.Label className="mb-1 fw-medium">{getLabel("receivedVia")}</Form.Label>
                <Form.Select size="sm" name="receivedVia" value={formData.receivedVia}
                  onChange={handleChange} onBlur={() => validateField("receivedVia", formData.receivedVia)}>
                  <option value="">Select an option</option>
                  {bookingModes.map(m => <option key={m.tripBookingModeId} value={m.tripBookingModeId}>{m.tripBookingModeName}</option>)}
                </Form.Select>
                {errors.receivedVia && <div className="text-danger small">{errors.receivedVia}</div>}
              </Col>
            </Row>

            <CustomerPopup show={showCustomerPopup} handleClose={() => setShowCustomerPopup(false)}
              onSelect={c => { setCustomerId(c.customerId); setFormData((p: any) => ({ ...p, customerName: c.customerName })); setShowCustomerPopup(false); }} />

            <DriverPopup show={showDriverPopup} handleClose={() => setShowDriverPopup(false)}
              onSelect={d => { setDriverId(d.driverId); setFormData((p: any) => ({ ...p, driverName: d.driverName })); setShowDriverPopup(false); }} />

            {/* FROM */}
            <Row className="mb-2 mx-3">
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("fromDate")}</Form.Label>
                <Row>
                  <Col sm={5}>
                    <Form.Control size="sm" type="date" name="fromDate" value={formData.fromDate}
                      onChange={handleChange} onBlur={() => validateField("fromDate", formData.fromDate)} />
                    {errors.fromDate && <div className="text-danger small">{errors.fromDate}</div>}
                  </Col>

                  <Col sm={5}>
                    <Form.Select size="sm" name="fromTime" value={formData.fromTime}
                      onChange={handleChange} onBlur={() => validateField("fromTime", formData.fromTime)}>
                      <option value="">Select an option</option>
                      {timesList.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                    {errors.fromTime && <div className="text-danger small">{errors.fromTime}</div>}
                  </Col>

                  <Col sm={2}>
                    <Form.Select size="sm" name="fromAmPm" value={formData.fromAmPm}
                      onChange={handleChange} onBlur={() => validateField("fromAmPm", formData.fromAmPm)}>
                      <option value="">Select</option>
                      <option>AM</option>
                      <option>PM</option>
                    </Form.Select>
                    {errors.fromAmPm && <div className="text-danger small">{errors.fromAmPm}</div>}
                  </Col>
                </Row>
              </Col>

              {/* TO */}
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("toDate")}</Form.Label>
                <Row>
                  <Col sm={5}>
                    <Form.Control size="sm" type="date" name="toDate" value={formData.toDate}
                      onChange={handleChange} onBlur={() => validateField("toDate", formData.toDate)} />
                    {errors.toDate && <div className="text-danger small">{errors.toDate}</div>}
                  </Col>

                  <Col sm={5}>
                    <Form.Select size="sm" name="toTime" value={formData.toTime}
                      onChange={handleChange} onBlur={() => validateField("toTime", formData.toTime)}>
                      <option value="">Select an option</option>
                      {timesList.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                    {errors.toTime && <div className="text-danger small">{errors.toTime}</div>}
                  </Col>

                  <Col sm={2}>
                    <Form.Select size="sm" name="toAmPm" value={formData.toAmPm}
                      onChange={handleChange} onBlur={() => validateField("toAmPm", formData.toAmPm)}>
                      <option value="">Select</option>
                      <option>AM</option>
                      <option>PM</option>
                    </Form.Select>
                    {errors.toAmPm && <div className="text-danger small">{errors.toAmPm}</div>}
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* PICKUP / DRIVER */}
            <Row className="mb-2 mx-3">
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("pickupFrom")}</Form.Label>
                <Form.Control size="sm" type="text" name="pickupFrom" maxLength={50} className="p-2"
                  placeholder="Enter pickup location" value={formData.pickupFrom}
                  onChange={handleChange} onBlur={() => validateField("pickupFrom", formData.pickupFrom)} />
                {errors.pickupFrom && <div className="text-danger small">{errors.pickupFrom}</div>}
              </Col>

              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("driverName")}</Form.Label>
                <InputGroup>
                  <Form.Control size="sm" type="text" readOnly name="driverName"
                    placeholder="Enter driver name" value={formData.driverName}
                    onChange={handleChange} onBlur={() => validateField("driverName", formData.driverName)} />
                  <Button size="sm" style={{ backgroundColor: "#18575A" }} onClick={() => setShowDriverPopup(true)}>
                    <BsSearch />
                  </Button>
                </InputGroup>
                {errors.driverName && <div className="text-danger small">{errors.driverName}</div>}
              </Col>
            </Row>

            {/* Vehicle take off time */}
            <Row className="mb-2 mx-3">
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("vehicleTakeOfTime")}</Form.Label>
                <Row>
                  <Col sm={5}>
                    <Form.Control size="sm" type="date" name="vehicleTakeOfTime" value={formData.vehicleTakeOfTime}
                      onChange={handleChange} onBlur={() => validateField("vehicleTakeOfTime", formData.vehicleTakeOfTime)} />
                    {errors.vehicleTakeOfTime && <div className="text-danger small">{errors.vehicleTakeOfTime}</div>}
                  </Col>

                  <Col sm={5}>
                    <Form.Select size="sm" name="takeOffTime" value={formData.takeOffTime}
                      onChange={handleChange} onBlur={() => validateField("takeOffTime", formData.takeOffTime)}>
                      <option value="">Select time</option>
                      {timesList.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                    {errors.takeOffTime && <div className="text-danger small">{errors.takeOffTime}</div>}
                  </Col>

                  <Col sm={2}>
                    <Form.Select size="sm" name="takeOffAmPm" value={formData.takeOffAmPm}
                      onChange={handleChange} onBlur={() => validateField("takeOffAmPm", formData.takeOffAmPm)}>
                      <option value="">Select</option>
                      <option>AM</option>
                      <option>PM</option>
                    </Form.Select>
                    {errors.takeOffAmPm && <div className="text-danger small">{errors.takeOffAmPm}</div>}
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("paymentMode")}</Form.Label>
                <Form.Select size="sm" name="paymentMode" value={formData.paymentMode}
                  onChange={handleChange} onBlur={() => validateField("paymentMode", formData.paymentMode)}>
                  <option value="">Select an option</option>
                  <option>Cash</option>
                  <option>Debit</option>
                  <option>POS</option>
                  <option>Bank Transfer</option>
                </Form.Select>
                {errors.paymentMode && <div className="text-danger small">{errors.paymentMode}</div>}
              </Col>
            </Row>

            {/* PAYMENT */}
            <Row className="mb-2 mx-3">
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("paymentDetails")}</Form.Label>
                <Form.Control as="textarea" rows={2} name="paymentDetails"
                  value={formData.paymentDetails} onChange={handleChange}
                  onBlur={() => validateField("paymentDetails", formData.paymentDetails)} />
              </Col>
              <Col md={6}>
                <Form.Label className="mb-1 fw-medium">{getLabel("details")}</Form.Label>
                <Form.Control as="textarea" rows={2} name="details"
                  value={formData.details} onChange={handleChange}
                  onBlur={() => validateField("details", formData.details)} />
              </Col>
            </Row>

            {/* DROP LOCATIONS & DETAILS */}
            <Row className="mb-2 mx-3">

              <Col md={6}>
                <KiduDropLocation values={formData.dropLocations} onChange={handleDropChange} />
                {errors.dropLocations && <div className="text-danger small">{errors.dropLocations}</div>}
              </Col>
            </Row>


            {/* Reset + Update Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4 me-4">
              <KiduReset initialValues={originalData} setFormData={setFormData} />
              <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>

            {/* Payment Accordion */}
            <Row className="mb-2 mx-3 mt-3">
              <Col xs={12}>
                <KiduCommentAccordion
                  tableName="Trip"
                  recordId={recordId}
                />
                <KiduPaymentAccordion
                  key={`payment-${refreshKey}`}
                  relatedEntityId={recordId}
                  relatedEntityType="Trip"
                  heading="Payment Details"
                />
              </Col>
            </Row>

            {/* Kilometer Accordion */}
            <Row className="mb-2 mx-3">
              <Col xs={12}>
                <KiduKilometerAccordion
                  key={`km-${refreshKey}`}
                  tripId={recordId}
                // driverId={driverId}
                />
              </Col>
            </Row>

            {/* Attachments */}
            <Row className="mb-2 mx-3">
              <Col xs={12}>
                <Attachments tableName={tableName} recordId={recordId} />
              </Col>
            </Row>

            {/* Audit Logs */}
            <Row className="mb-2 mx-3">
              <Col xs={12}>
                <AuditTrailsComponent tableName={tableName} recordId={recordId} />
              </Col>
            </Row>

          </Form>
        </Card.Body>
      </Card>

      <Toaster position="top-right" />
    </>
  );
};

export default TripEdit;