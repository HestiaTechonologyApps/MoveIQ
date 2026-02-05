// src/components/Vehicles/VehicleEdit.tsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import VehicleService from "../../../services/vehicle/Vehicles.services";
import type { Vehicle } from "../../../types/vehicle/Vehicles.types";
import KiduValidation from "../../../components/KiduValidation";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import Attachments from "../../../components/KiduAttachments";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import KiduPaymentAccordion from "../../../components/KiduPaymentAccordion";

const VehicleEdit: React.FC = () => {
    const navigate = useNavigate();
    const { vehicleId } = useParams();

    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<any>({});
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<any>({});

    const tableName = "vehicle";
    const recordId = Number(vehicleId);

    const yearOptions = Array.from({ length: 26 }, (_, i) => ({
        value: (2000 + i).toString(),
        label: (2000 + i).toString(),
    }));

    const statusOptions = ["Active", "Operational", "Non-Operational", "Scrap"].map((s) => ({
        value: s,
        label: s,
    }));

    const fields = [
        { name: "registrationNumber", rules: { required: true, type: "text", label: "Registration Number" } },
        { name: "make", rules: { required: true, type: "text", label: "Make" } },
        { name: "model", rules: { required: true, type: "text", label: "Model" } },
        { name: "year", rules: { required: true, type: "text", label: "Year" } },
        { name: "chassisNumber", rules: { required: true, type: "text", label: "Chassis Number" } },
        { name: "engineNumber", rules: { required: true, type: "text", label: "Engine Number" } },
        { name: "vehicleType", rules: { required: true, type: "text", label: "Vehicle Type" } },
        { name: "registrationExpiry", rules: { required: true, type: "date", label: "Registration Expiry" } },
        { name: "insuranceExpiry", rules: { required: true, type: "date", label: "Insurance Expiry" } },
        { name: "currentStatus", rules: { required: true, type: "text", label: "Current Status" } },
        { name: "location", rules: { required: true, type: "text", label: "Location" } },
    ];

    useEffect(() => {
        const loadVehicle = async () => {
            try {
                const res = await VehicleService.getById(Number(vehicleId));
                console.log(res);

                if (res.isSucess && res.value) {
                    const d: Vehicle = res.value;

                    const loadedValues = {
                        registrationNumber: d.registrationNumber || "",
                        make: d.make || "",
                        model: d.model || "",
                        year: d.year ? String(d.year) : "",
                        chassisNumber: d.chassisNumber || "",
                        engineNumber: d.engineNumber || "",
                        vehicleType: d.vehicleType || "",
                        registrationExpiry: d.registrationExpiry
                            ? d.registrationExpiry.split("T")[0]
                            : "",
                        insuranceExpiry: d.insuranceExpiry
                            ? d.insuranceExpiry.split("T")[0]
                            : "",
                        currentStatus: d.currentStatus || "",
                        location: d.location || "",
                    };
                    setFormData(loadedValues);
                    setInitialValues(loadedValues);
                    const errValues: any = {};
                    fields.forEach(f => { errValues[f.name] = ""; });
                    setErrors(errValues);
                } else {
                    toast.error("Failed to load vehicle details");
                    navigate("/dashboard/vehicle/vehicle-list");
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load vehicle details");
                navigate("/dashboard/vehicle/vehicle-list");
            } finally {
                setLoading(false);
            }
        };

        loadVehicle();
    }, [vehicleId, navigate]);

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        const updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;
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

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!validateForm()) return;
        const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

        try {

            const vehicleData: Vehicle | any = {
                vehicleId: Number(vehicleId),
                registrationNumber: formData.registrationNumber,
                make: formData.make,
                model: formData.model,
                year: formData.year,
                chassisNumber: formData.chassisNumber,
                engineNumber: formData.engineNumber,
                vehicleType: formData.vehicleType,
                registrationExpiry: formData.registrationExpiry || null,
                insuranceExpiry: formData.insuranceExpiry || null,
                currentStatus: formData.currentStatus,
                location: formData.location,
                createdDate: formData.createdDate,
                updatedDate: new Date().toISOString(),
                updatedBy: loggedUser.userEmail || "User",
            };

            const res = await VehicleService.update(Number(vehicleId), vehicleData);
            if (res.isSucess) {
                toast.success("Vehicle updated successfully!");
                setTimeout(() => navigate("/dashboard/vehicle/vehicle-list"), 1500);
            } else {
                toast.error(res?.customMessage || res?.error || "Failed to update vehicle");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update vehicle");
        }
    };

    if (loading) return <KiduLoader type="vehicle details..." />;

    return (
        <>
            <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
                <div className="d-flex align-items-center mb-3">
                    <div className="me-2 mt-3"><KiduPrevious /></div>
                    <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Edit Vehicle</h4>
                </div>

                <hr />

                <Form onSubmit={handleSubmit} className="p-4">
                    <Row>
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[0].rules.label} {fields[0].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[0].name} placeholder="Enter registration number"
                                value={formData[fields[0].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[0].name, formData[fields[0].name])} />
                            {errors[fields[0].name] && <span className="text-danger">{errors[fields[0].name]}</span>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[1].rules.label} {fields[1].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[1].name} placeholder="Enter make"
                                value={formData[fields[1].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[1].name, formData[fields[1].name])} />
                            {errors[fields[1].name] && <small className="text-danger">{errors[fields[1].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[2].rules.label} {fields[2].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[2].name} placeholder="Enter model"
                                value={formData[fields[2].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[2].name, formData[fields[2].name])} />
                            {errors[fields[2].name] && <small className="text-danger">{errors[fields[2].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[3].rules.label} {fields[3].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Select name={fields[3].name} value={formData[fields[3].name]} onChange={handleChange} onBlur={() => validateField(fields[3].name, formData[fields[3].name])}>
                                <option value="">Select Year</option>
                                {yearOptions.map((y, i) => <option key={i} value={y.value}>{y.label}</option>)}
                            </Form.Select>
                            {errors[fields[3].name] && <small className="text-danger">{errors[fields[3].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[4].rules.label} {fields[4].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[4].name} placeholder="Enter chassis number"
                                value={formData[fields[4].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[4].name, formData[fields[4].name])} />
                            {errors[fields[4].name] && <small className="text-danger">{errors[fields[4].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[5].rules.label} {fields[5].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[5].name} placeholder="Enter engine number"
                                value={formData[fields[5].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[5].name, formData[fields[5].name])} />
                            {errors[fields[5].name] && <small className="text-danger">{errors[fields[5].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[6].rules.label} {fields[6].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[6].name} placeholder="Enter vehicle type"
                                value={formData[fields[6].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[6].name, formData[fields[6].name])} />
                            {errors[fields[6].name] && <small className="text-danger">{errors[fields[6].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[7].rules.label} {fields[7].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="date" name={fields[7].name}
                                value={formData[fields[7].name] || ""}
                                onChange={handleChange}
                                onBlur={() => validateField(fields[7].name, formData[fields[7].name])} />
                            {errors[fields[7].name] && <small className="text-danger">{errors[fields[7].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[8].rules.label} {fields[8].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="date" name={fields[8].name}
                                value={formData[fields[8].name] || ""}
                                onChange={handleChange}
                                onBlur={() => validateField(fields[8].name, formData[fields[8].name])} />
                            {errors[fields[8].name] && <small className="text-danger">{errors[fields[8].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[9].rules.label} {fields[9].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Select name={fields[9].name} value={formData[fields[9].name]} onChange={handleChange} onBlur={() => validateField(fields[9].name, formData[fields[9].name])}>
                                <option value="">Select Status</option>
                                {statusOptions.map((s, i) => <option key={i} value={s.value}>{s.label}</option>)}
                            </Form.Select>
                            {errors[fields[9].name] && <small className="text-danger">{errors[fields[9].name]}</small>}
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[10].rules.label} {fields[10].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Control type="text" name={fields[10].name} placeholder="Enter location"
                                value={formData[fields[10].name]} onChange={handleChange}
                                onBlur={() => validateField(fields[10].name, formData[fields[10].name])} />
                            {errors[fields[10].name] && <small className="text-danger">{errors[fields[10].name]}</small>}
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                        <KiduReset initialValues={initialValues} setFormData={setFormData} />
                        <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>Update</Button>
                    </div>

                    <Row className="mb-2 mt-4">
                        <Col xs={12}>
                            {/* Payment Accordion */}
                            <KiduPaymentAccordion
                                relatedEntityId={recordId}
                                relatedEntityType="vehicle"
                                heading="Payment Details"
                            />
                            <Attachments tableName={tableName} recordId={recordId} />
                        </Col>
                    </Row>

                    <div className="mt-3">
                        <AuditTrailsComponent tableName={tableName} recordId={recordId} />
                    </div>
                </Form>
            </Container>

            <Toaster position="top-right" />
        </>
    );
};

export default VehicleEdit;
