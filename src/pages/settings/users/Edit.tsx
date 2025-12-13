import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import CompanyService from "../../../services/settings/Company.services";
import UserService from "../../../services/settings/User.services";
import KiduValidation from "../../../components/KiduValidation";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import KiduLoader from "../../../components/KiduLoader";
import Attachments from "../../../components/KiduAttachments";

const UserEdit: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const fields = [
    { name: "userName", rules: { required: true, type: "text", label: "User Name" } },
    { name: "companyId", rules: { required: true, type: "select", label: "Company" } },
    { name: "userEmail", rules: { required: true, type: "email", label: "Email ID" } },
    { name: "phoneNumber", rules: { required: true, type: "number", minLength: 10, maxLength: 10, label: "Phone Number" } },
    { name: "address", rules: { required: false, type: "text", label: "Address" } }
  ];

  const [formData, setFormData] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableName = "User";
  const recordId = Number(userId);

  // ---------------- Load Companies ----------------
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

  // ---------------- Load User ----------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await UserService.getById(Number(userId));
        if (res.isSucess && res.value) {
          const d = res.value;

          const loadedValues = {
            userName: d.userName || "",
            companyId: d.companyId || "",
            userEmail: d.userEmail || "",
            phoneNumber: d.phoneNumber || "",
            address: d.address || "",
            createAt:d.createAt || ""
          };

          setFormData(loadedValues);
          setInitialValues(loadedValues);

          const errObj: any = {};
          fields.forEach(f => (errObj[f.name] = ""));
          setErrors(errObj);
        } else {
          toast.error("Failed to load user details");
          navigate("/dashboard/settings/user-list");
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/dashboard/settings/user-list");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, navigate]);

  // ---------------- Handle Change ----------------
  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;

    setFormData((prev: any) => ({ ...prev, [name]: updated }));

    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  // ---------------- Validation ----------------
  const validateField = (name: string, value: any) => {
    const rule = fields.find(f => f.name === name)?.rules;
    if (!rule) return true;
    const result = KiduValidation.validate(value, rule as any);
    setErrors((prev: any) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message
    }));
    return result.isValid;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userData = {
        ...formData,
        userId: Number(userId),
        isActive: true
      };

      const res = await UserService.update(Number(userId), userData);

      if (res.isSucess) {
        toast.success("User updated successfully!");
        setTimeout(() => navigate("/dashboard/settings/user-list"), 1500);
      } else {
        toast.error(res.customMessage || res.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <KiduLoader type="user details..." />;

  return (
    <>
      <Container
        className="px-4 mt-5 shadow-sm rounded bg-white"
        style={{ fontFamily: "Urbanist" }}
      >
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3">
            <KiduPrevious />
          </div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>
            Edit User
          </h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* USERNAME */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[0].rules.label} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="userName"
                value={formData.userName}
                placeholder="Enter username"
                 maxLength={30}
                onChange={handleChange}
                onBlur={() => validateField("userName", formData.userName)}
              />
              {errors.userName && (
                <small className="text-danger">{errors.userName}</small>
              )}
            </Col>

            {/* COMPANY DROPDOWN */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[1].rules.label} <span className="text-danger">*</span>
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
              {errors.companyId && (
                <small className="text-danger">{errors.companyId}</small>
              )}
            </Col>

            {/* EMAIL */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[2].rules.label} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="userEmail"
                value={formData.userEmail}
                placeholder="Enter email"
                onChange={handleChange}
                onBlur={() => validateField("userEmail", formData.userEmail)}
              />
              {errors.userEmail && (
                <small className="text-danger">{errors.userEmail}</small>
              )}
            </Col>

            {/* PHONE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[3].rules.label} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Enter phone number"
                onChange={handleChange}
                onBlur={() => validateField("phoneNumber", formData.phoneNumber)}
              />
              {errors.phoneNumber && (
                <small className="text-danger">{errors.phoneNumber}</small>
              )}
            </Col>

            {/* ADDRESS */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[4].rules.label}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                placeholder="Enter address"
                 maxLength={200}
                onChange={handleChange}
                onBlur={() => validateField("address", formData.address)}
              />
              {errors.address && (
                <small className="text-danger">{errors.address}</small>
              )}
            </Col>
          </Row>

          {/* BUTTONS */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>
              Update
            </Button>
          </div>
          <div className="mt-3">
             <Attachments tableName="USER" recordId={recordId} />
            <AuditTrailsComponent tableName={tableName} recordId={recordId} />
          </div>
        </Form>
      </Container>

      <Toaster position="top-right" />
    </>
  );
};

export default UserEdit;
