import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ExpenseTypeService from "../../../services/settings/ExpenseType.services";
import KiduValidation from "../../../components/KiduValidation";
import type { ExpenseType } from "../../../types/settings/Expense.types";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";

const EditExpenseType: React.FC = () => {
  const navigate = useNavigate();
  const { expenseTypeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const tableName = "expenseType";
  const recordId = Number(expenseTypeId);

  const creditDebitTypeOptions = ["Credit", "Debit", "Indicative"].map(
    (cd) => ({ value: cd, label: cd })
  );

  const fields = [
    {
      name: "expenseTypeName",
      rules: { required: true, type: "text", label: "Expense Type Name" },
    },
    {
      name: "expenseTypeCode",
      rules: { required: true, type: "text", label: "Expense Type Code" },
    },
    { name: "creditDebitType", rules: { required: true, type: "text", label: "Credit Debit Type" } },
    {
      name: "description",
      rules: { required: false, type: "text", label: "Description" },
    },
  ];

  useEffect(() => {
    const loadExpenseType = async () => {
      try {
        const res = await ExpenseTypeService.getById(Number(expenseTypeId));
        if (res.isSucess && res.value) {
          const d = res.value;
          const loadedValues = {
            expenseTypeName: d.expenseTypeName || "",
            expenseTypeCode: d.expenseTypeCode || "",
            creditDebitType: d.creditDebitType || "",
            description: d.description || "",
          };
          setFormData(loadedValues);
          setInitialValues(loadedValues);
          const errObj: any = {};
          fields.forEach((f) => (errObj[f.name] = ""));
          setErrors(errObj);
        } else {
          toast.error("Failed to load expense type details");
          navigate("/dashboard/settings/expense-type-list");
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/dashboard/settings/expense-type-list");
      } finally {
        setLoading(false);
      }
    };
    loadExpenseType();
  }, [expenseTypeId, navigate]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const rule = fields.find((f) => f.name === name)?.rules;
    if (!rule) return true;
    const result = KiduValidation.validate(value, rule as any);
    setErrors((prev: any) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message,
    }));
    return result.isValid;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach((f) => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data: ExpenseType = {
        expenseTypeId: Number(expenseTypeId),
        expenseTypeName: formData.expenseTypeName,
        expenseTypeCode: formData.expenseTypeCode,
        creditDebitType: formData.creditDebitType,
        description: formData.description,
        isActive: true,
        isDeleted: false
      };

      const res = await ExpenseTypeService.update(Number(expenseTypeId), data);
      if (res.isSucess) {
        toast.success("Expense Type updated successfully!");
        setTimeout(
          () => navigate("/dashboard/settings/expense-type-list"),
          1500
        );
      } else {
        toast.error(res.customMessage || res.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <KiduLoader type="expense type details..." />;

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
            Edit Expense Type
          </h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* Expense Type Name */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[0].rules.label}{" "}
                {fields[0].rules.required && (
                  <span className="text-danger">*</span>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                name={fields[0].name}
                placeholder="Enter expense type name"
                value={formData[fields[0].name]}
                onChange={handleChange}
                onBlur={() =>
                  validateField(fields[0].name, formData[fields[0].name])
                }
              />
              {errors[fields[0].name] && (
                <small className="text-danger">
                  {errors[fields[0].name]}
                </small>
              )}
            </Col>

            {/* Expense Type Code */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[1].rules.label}{" "}
                {fields[1].rules.required && (
                  <span className="text-danger">*</span>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                name={fields[1].name}
                placeholder="Enter code"
                value={formData[fields[1].name]}
                onChange={handleChange}
                onBlur={() =>
                  validateField(fields[1].name, formData[fields[1].name])
                }
              />
              {errors[fields[1].name] && (
                <small className="text-danger">
                  {errors[fields[1].name]}
                </small>
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


            {/* Description */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[3].rules.label}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name={fields[3].name}
                placeholder="Enter description"
                maxLength={150}
                value={formData[fields[3].name]}
                onChange={handleChange}
              />
            </Col>
          </Row>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button
              style={{ backgroundColor: "#18575A", border: "none" }}
              type="submit"
            >
              Update
            </Button>
          </div>
        </Form>
      </Container>

      {/* Audit Trails */}
      <div className="mt-3">
        <AuditTrailsComponent tableName={tableName} recordId={recordId} />
      </div>

      <Toaster position="top-right" />
    </>
  );
};

export default EditExpenseType;
