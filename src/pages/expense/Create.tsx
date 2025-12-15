import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { KiduValidation } from "../../components/KiduValidation";
import KiduPrevious from "../../components/KiduPrevious";
import KiduReset from "../../components/ReuseButtons/KiduReset";
import ExpenseTypeService from "../../services/settings/ExpenseType.services";
import ExpenseMasterService from "../../services/Expense.services";

const CreateExpense: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    {
      name: "expenseTypeId",
      rules: { required: true, type: "select", label: "Expense Type" },
    },
    {
      name: "createdOn",
      rules: { required: true, type: "date", label: "Expense Date" },
    },
    {
      name: "amount",
      rules: { required: true, type: "number", label: "Amount (₹)" },
    },
    {
      name: "paymentMode",
      rules: { required: true, type: "select", label: "Payment Mode" },
    },
    {
      name: "relatedEntityType",
      rules: { required: true, type: "text", label: "Related Entity Type" },
    },
    {
      name: "relatedEntityId",
      rules: { required: true, type: "number", label: "Related Entity ID" },
    },
    { name: "remark", rules: { required: false, type: "text", label: "Remarks" } },
  ];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach((f) => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  /** DROPDOWN: EXPENSE TYPES API */
  const [expenseTypes, setExpenseTypes] = useState<
    { expenseTypeId: number; expenseTypeName: string }[]
  >([]);

  const paymentModes = ["Cash", "Debit", "POS", "Bank Transfer"];

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await ExpenseTypeService.getAll();
        if (response.isSucess) {
          setExpenseTypes(response.value);
        }
      } catch (err) {
        console.error("Error fetching expense types", err);
      }
    };
    fetchTypes();
  }, []);

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

  /** SUBMIT HANDLER */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;
    const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const expenseData = {
        expenseTypeId: Number(formData.expenseTypeId),
        remark: formData.remark,
        createdOn: formData.createdOn,
        createdBy: loggedUser.userEmail || "User",
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        relatedEntityId: Number(formData.relatedEntityId),
        relatedEntityType: formData.relatedEntityType
      };
      console.log(expenseData);
      
      const response = await ExpenseMasterService.create(expenseData);
      console.log(response);
      
      if (response.isSucess) {
        toast.success("Expense added successfully!");
        setTimeout(() => navigate("/dashboard/expense-list"), 1500);
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
        {/* HEADER */}
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3">
            <KiduPrevious />
          </div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>
            Add New Expense
          </h4>
        </div>

        <hr />

        {/* FORM */}
        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* EXPENSE TYPE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[0].rules.label}  <span className="text-danger">*</span>
              </Form.Label>

              <Form.Select
                name="expenseTypeId"
                value={formData.expenseTypeId}
                onChange={handleChange}
                onBlur={() =>
                  validateField("expenseTypeId", formData.expenseTypeId)
                }
              >
                <option value="">Select Expense Type</option>
                {expenseTypes.map((et) => (
                  <option key={et.expenseTypeId} value={et.expenseTypeId}>
                    {et.expenseTypeName}
                  </option>
                ))}
              </Form.Select>

              {errors.expenseTypeId && (
                <small className="text-danger">{errors.expenseTypeId}</small>
              )}
            </Col>

            {/* DATE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[1].rules.label}  <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                type="date"
                name="createdOn"
                value={formData.createdOn}
                onChange={handleChange}
                onBlur={() => validateField("createdOn", formData.createdOn)}
              />

              {errors.createdOn && (
                <small className="text-danger">{errors.createdOn}</small>
              )}
            </Col>

            {/* AMOUNT */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[2].rules.label} <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                onBlur={() => validateField("amount", formData.amount)}
              />

              {errors.amount && (
                <small className="text-danger">{errors.amount}</small>
              )}
            </Col>

            {/* PAYMENT MODE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[3].rules.label}  <span className="text-danger">*</span>
              </Form.Label>

              <Form.Select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                onBlur={() =>
                  validateField("paymentMode", formData.paymentMode)
                }
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </Form.Select>

              {errors.paymentMode && (
                <small className="text-danger">{errors.paymentMode}</small>
              )}
            </Col>

            {/* RELATED ENTITY TYPE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[4].rules.label}  <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                type="text"
                name="relatedEntityType"
                placeholder="Enter related entity type"
                value={formData.relatedEntityType}
                onChange={handleChange}
                onBlur={() =>
                  validateField(
                    "relatedEntityType",
                    formData.relatedEntityType
                  )
                }
              />

              {errors.relatedEntityType && (
                <small className="text-danger">
                  {errors.relatedEntityType}
                </small>
              )}
            </Col>

            {/* RELATED ENTITY ID */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[5].rules.label}  <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                type="number"
                name="relatedEntityId"
                placeholder="Enter related entity ID"
                value={formData.relatedEntityId}
                onChange={handleChange}
                onBlur={() =>
                  validateField("relatedEntityId", formData.relatedEntityId)
                }
              />

              {errors.relatedEntityId && (
                <small className="text-danger">{errors.relatedEntityId}</small>
              )}
            </Col>

            {/* REMARK */}
            <Col md={12} className="mb-3">
              <Form.Label className="fw-semibold">{fields[6].rules.label} </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remark"
                placeholder="Enter remarks"
                value={formData.remark}
                onChange={handleChange}
              />
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

export default CreateExpense;
