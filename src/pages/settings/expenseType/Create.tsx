import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import ExpenseTypeService from "../../../services/settings/ExpenseType.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const CreateExpenseType: React.FC = () => {
    const navigate = useNavigate();

    const creditDebitTypeOptions = ["Credit", "Debit", "Indicative"].map(
        (cd) => ({ value: cd, label: cd })
    );

    const fields = [
        { name: "expenseTypeName", rules: { required: true, type: "text", label: "Expense Type Name" } },
        { name: "expenseTypeCode", rules: { required: true, type: "text", label: "Expense Type Code" } },
        { name: "creditDebitType", rules: { required: true, type: "text", label: "Credit Debit Type" } },
        { name: "description", rules: { required: false, type: "text", label: "Description" } }
    ];

    const initialValues: any = {};
    const initialErrors: any = {};
    fields.forEach(f => { initialValues[f.name] = ""; initialErrors[f.name] = ""; });

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState(initialErrors);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
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
        fields.forEach(f => {
            if (!validateField(f.name, formData[f.name])) ok = false;
        });
        return ok;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const expenseTypeData = {
                ...formData,
                expenseTypeId: 0,
                createdAt: new Date().toISOString(),
                isActive: true,
            };

            const response = await ExpenseTypeService.create(expenseTypeData);
            if (response.isSucess) {
                toast.success("Expense Type added successfully!");
                setTimeout(() => navigate("/dashboard/settings/expense-type-list"), 2000);
            } else {
                toast.error(response.customMessage || response.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <Container
                className="px-4 mt-5 shadow-sm rounded"
                style={{ backgroundColor: "white", fontFamily: "Urbanist" }}
            >
                <div className="d-flex align-items-center mb-3">
                    <div className="me-2 mt-3">
                        <KiduPrevious />
                    </div>
                    <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>
                        Add Expense Type
                    </h4>
                </div>
                <hr />
                <Form onSubmit={handleSubmit} className="p-4">
                    <Row>
                        {/* EXPENSE TYPE NAME */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[0].rules.label}
                                {fields[0].rules.required && <span className="text-danger">*</span>}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="expenseTypeName"
                                placeholder="Enter expense type name"
                                value={formData.expenseTypeName}
                                onChange={handleChange}
                                onBlur={() => validateField("expenseTypeName", formData.expenseTypeName)}
                            />
                            {errors.expenseTypeName && (
                                <small className="text-danger">{errors.expenseTypeName}</small>
                            )}
                        </Col>
                        {/* EXPENSE TYPE CODE */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[1].rules.label}
                                {fields[1].rules.required && <span className="text-danger">*</span>}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="expenseTypeCode"
                                placeholder="Enter code"
                                value={formData.expenseTypeCode}
                                onChange={handleChange}
                                onBlur={() => validateField("expenseTypeCode", formData.expenseTypeCode)}
                            />
                            {errors.expenseTypeCode && (
                                <small className="text-danger">{errors.expenseTypeCode}</small>
                            )}
                        </Col>

                        {/* credit debit Dropdown */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">{fields[2].rules.label} {fields[2].rules.required ? <span className="text-danger">*</span> : ""}</Form.Label>
                            <Form.Select
                                name={fields[2].name}
                                value={formData.creditDebitType}
                                onChange={handleChange}
                                onBlur={() =>
                                    validateField("creditDebitType", formData.creditDebitType)
                                }
                            >
                                <option value="" disabled >Select</option>
                                {creditDebitTypeOptions.map((cd, i) => (
                                    <option key={i} value={cd.value}>
                                        {cd.label}
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.creditDebitType && (
                                <small className="text-danger">{errors.creditDebitType}</small>
                            )}
                        </Col>

                        {/* DESCRIPTION */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[3].rules.label}
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                placeholder="Enter description"
                                maxLength={150}
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={() => validateField("description", formData.description)}
                            />
                            {errors.description && (
                                <small className="text-danger">{errors.description}</small>
                            )}
                        </Col>

                    </Row>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                        <KiduReset initialValues={initialValues} setFormData={setFormData} />

                        <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>
                            Submit
                        </Button>
                    </div>

                </Form>
            </Container>

            <Toaster position="top-right" />
        </>
    );
};

export default CreateExpenseType;
