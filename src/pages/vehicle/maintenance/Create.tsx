import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import type { Vehicle } from "../../../types/vehicle/Vehicles.types";
import KiduValidation from "../../../components/KiduValidation";
import VehicleMaintenanceService from "../../../services/vehicle/Maintenance.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import VehiclePopUp from "../vehicles/VehiclePopUp";
import { BsSearch } from "react-icons/bs";

const CreateVehicleMaintenance: React.FC = () => {
    const navigate = useNavigate();

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

    const initialValues: any = {};
    const initialErrors: any = {};
    fields.forEach(f => { initialValues[f.name] = ""; initialErrors[f.name] = ""; });

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState(initialErrors);
    const [showVehiclePopup, setShowVehiclePopup] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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
                vehicleMaintenanceRecordId: 0,
                createdBy: loggedUser.userEmail || "User",
                createdDate: new Date().toISOString()
            };

            const response = await VehicleMaintenanceService.create(payload);
            if (response.isSucess) {
                toast.success("Maintenance record added successfully!");
                setTimeout(() => navigate("/dashboard/vehicle/maintenance-list"), 2000);
            } else {
                toast.error(response.customMessage || response.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <Container className="px-4 mt-5 shadow-sm rounded" style={{ backgroundColor: "white", fontFamily: "Urbanist" }}>
                <div className="d-flex align-items-center mb-3">
                    <div className="me-2 mt-3"><KiduPrevious /></div>
                    <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Add Vehicle Maintenance</h4>
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
                                    value={selectedVehicle ? `${selectedVehicle.vehicleType} - ${selectedVehicle.registrationNumber}` : ""} 
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
                        <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>Submit</Button>
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

export default CreateVehicleMaintenance;