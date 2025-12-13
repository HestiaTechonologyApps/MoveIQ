import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import CompanyService from "../../../services/settings/Company.services";
import KiduValidation from "../../../components/KiduValidation";
import UserService from "../../../services/settings/User.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const CreateUser: React.FC = () => {
    const navigate = useNavigate();

    const fields = [
        { name: "userName", rules: { required: true, type: "text", label: "User Name" } },
        { name: "passwordHash", rules: { required: true, type: "password", label: "Password" } },
        { name: "companyId", rules: { required: true, type: "select", label: "Company" } },
        { name: "userEmail", rules: { required: true, type: "email", label: "Email ID" } },
        { name: "phoneNumber", rules: { required: true, type: "number", minLength: 10, maxLength: 10, label: "Phone Number" } },
        { name: "address", rules: { required: false, type: "text", label: "Address" } }
    ];

    const initialValues: any = {};
    const initialErrors: any = {};
    fields.forEach(f => { initialValues[f.name] = ""; initialErrors[f.name] = ""; });

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState(initialErrors);
    const [companies, setCompanies] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    // -------------------- FETCH COMPANIES --------------------
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const res = await CompanyService.getAll();
                if (res.isSucess) setCompanies(res.value);
                else toast.error("Failed to load companies");
            } catch (err: any) {
                toast.error(err.message);
            }
        };
        loadCompanies();
    }, []);

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

        try {
            const userData = {
                ...formData,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            const res = await UserService.create(userData);
            if (res.isSucess) {
                toast.success("User created successfully!");
                setTimeout(() => navigate("/dashboard/settings/user-list"), 1500);
            } else {
                toast.error(res.customMessage || res.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <Container className="px-4 mt-5 shadow-sm rounded"
                style={{ backgroundColor: "white", fontFamily: "Urbanist" }}
            >
                <div className="d-flex align-items-center mb-3">
                    <div className="me-2 mt-3"><KiduPrevious /></div>
                    <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>
                        Add New User
                    </h4>
                </div>

                <hr />

                <Form onSubmit={handleSubmit} autoComplete="off" className="p-4">
                    <Row>

                        {/* USER NAME */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[0].rules.label} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="userName"
                                autoComplete="new-user"
                                placeholder="Enter username"
                                maxLength={30}
                                value={formData.userName}
                                onChange={handleChange}
                                onBlur={() => validateField("userName", formData.userName)}
                            />
                            {errors.userName && <small className="text-danger">{errors.userName}</small>}
                        </Col>

                        {/* PASSWORD */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                               {fields[1].rules.label}  <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="passwordHash"
                                    autoComplete="new-password"
                                    placeholder="Enter password"
                                     maxLength={30}
                                    value={formData.passwordHash}
                                    onChange={handleChange}
                                    onBlur={() => validateField("passwordHash", formData.passwordHash)}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputGroup>
                            {errors.passwordHash && <small className="text-danger">{errors.passwordHash}</small>}
                        </Col>

                        {/* COMPANY DROPDOWN */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[2].rules.label}  <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                name="companyId"
                                value={formData.companyId}
                                onChange={handleChange}
                                onBlur={() => validateField("companyId", formData.companyId)}
                            >
                                <option value="">Select Company</option>
                                {companies.map((c: any) => (
                                    <option key={c.companyId} value={c.companyId}>
                                        {c.comapanyName}
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.companyId && <small className="text-danger">{errors.companyId}</small>}
                        </Col>

                        {/* EMAIL */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[3].rules.label} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="userEmail"
                                placeholder="Enter email"
                                value={formData.userEmail}
                                onChange={handleChange}
                                onBlur={() => validateField("userEmail", formData.userEmail)}
                            />
                            {errors.userEmail && <small className="text-danger">{errors.userEmail}</small>}
                        </Col>

                        {/* PHONE */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[4].rules.label}  <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phoneNumber"
                                placeholder="Enter phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                onBlur={() => validateField("phoneNumber", formData.phoneNumber)}
                            />
                            {errors.phoneNumber && <small className="text-danger">{errors.phoneNumber}</small>}
                        </Col>

                        {/* ADDRESS */}
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {fields[5].rules.label}
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="address"
                                placeholder="Enter address"
                                 maxLength={200}
                                value={formData.address}
                                onChange={handleChange}
                                onBlur={() => validateField("address", formData.address)}
                            />
                            {errors.address && <small className="text-danger">{errors.address}</small>}
                        </Col>
                    </Row>
                    {/* BUTTONS */}
                    <div className="d-flex gap-2 justify-content-end mt-4">
                        <KiduReset initialValues={initialValues} setFormData={setFormData} />
                        <Button
                            type="submit"
                            style={{ backgroundColor: "#18575A", border: "none" }}
                        >
                            Submit
                        </Button>
                    </div>
                </Form>
            </Container>

            <Toaster position="top-right" />
        </>
    );
};

export default CreateUser;
