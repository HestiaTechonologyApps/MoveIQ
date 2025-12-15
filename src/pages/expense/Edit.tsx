import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ExpenseTypeService from "../../services/settings/ExpenseType.services";
import ExpenseMasterService from "../../services/Expense.services";
import KiduValidation from "../../components/KiduValidation";
import type { Expenses } from "../../types/Expense.types";
import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import KiduReset from "../../components/ReuseButtons/KiduReset";
import Attachments from "../../components/KiduAttachments";
import AuditTrailsComponent from "../../components/KiduAuditLogs";

const ExpenseEdit: React.FC = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

  const tableName = "EXPENSEMASTER";
  const recordId = Number(expenseId);

  const fields = [
    { name: "expenseTypeId", rules: { required: true, type: "number", label: "Expense Type" } },
    { name: "createdOn", rules: { required: true, type: "date", label: "Expense Date" } },
    { name: "amount", rules: { required: true, type: "number", label: "Amount" } },
    { name: "paymentMode", rules: { required: true, type: "text", label: "Payment Mode" } },
    { name: "relatedEntityType", rules: { required: true, type: "text", label: "Related Entity Type" } },
    { name: "relatedEntityId", rules: { required: true, type: "number", label: "Related Entity ID" } },
    { name: "remark", rules: { required: false, type: "text", label: "Remarks" } },
  ];

  const paymentModes = ["Cash", "Debit", "POS", "Bank Transfer"];

  // Fetch expense types for dropdown
  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const response = await ExpenseTypeService.getAll();
        if (response.isSucess && response.value) setExpenseTypes(response.value);
      } catch (err) {
        console.error("Error fetching expense types", err);
      }
    };
    fetchExpenseTypes();
  }, []);

  // Load existing expense
  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        const res = await ExpenseMasterService.getById(Number(expenseId));
        if (res.isSucess && res.value) {
          const d = res.value;

          const loadedValues = {
            expenseMasterId: d.expenseMasterId,
            expenseTypeId: d.expenseTypeId || "",
            createdOn: d.createdOn ? d.createdOn.split("T")[0] : "",
            createdBy:d.createdBy || "",
            amount: d.amount || "",
            paymentMode: d.paymentMode || "",
            relatedEntityType: d.relatedEntityType || "",
            relatedEntityId: d.relatedEntityId || "",
            remark: d.remark || "",
            expenseVoucher: d.expenseVoucher || "",
          };

          setFormData(loadedValues);
          setInitialValues(loadedValues);

          const errValues: any = {};
          fields.forEach(f => { errValues[f.name] = ""; });
          setErrors(errValues);
        } else {
          toast.error("Failed to load expense details");
          navigate("/dashboard/expense-list");
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/dashboard/expense-list");
      } finally {
        setLoading(false);
      }
    };
    if (expenseId) loadExpense();
  }, [expenseId, navigate]);

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
      const payload: Expenses = {
        expenseMasterId: Number(expenseId),
        expenseTypeId: Number(formData.expenseTypeId),
        createdOn: formData.createdOn,
        createdBy:formData.createdBy,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        relatedEntityType: formData.relatedEntityType,
        relatedEntityId: Number(formData.relatedEntityId),
        remark: formData.remark,
        expenseVoucher: formData.expenseVoucher || "",
        isActive: true,
        isDeleted: false,
      };

      const res = await ExpenseMasterService.update(Number(expenseId), payload as any);
      if (res.isSucess) {
        toast.success("Expense updated successfully!");
        setTimeout(() => navigate("/dashboard/expense-list"), 1500);
      } else {
        toast.error(res.customMessage || res.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <KiduLoader type="expense details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3"><KiduPrevious /></div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Edit Expense</h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* Expense Voucher (read-only) */}
            {formData.expenseVoucher && (
              <Col md={6} className="mb-3">
                <Form.Label className="fw-semibold">Expense Voucher</Form.Label>
                <Form.Control type="text" value={formData.expenseVoucher} readOnly style={{ backgroundColor: "#f0f0f0" }} />
              </Col>
            )}

            {/* Expense Type */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[0].rules.label} <span className="text-danger">*</span></Form.Label>
              <Form.Select name="expenseTypeId" value={formData.expenseTypeId} onChange={handleChange} onBlur={() => validateField("expenseTypeId", formData.expenseTypeId)}>
                <option value="">Select Expense Type</option>
                {expenseTypes.map((type) => (
                  <option key={type.expenseTypeId} value={type.expenseTypeId}>{type.expenseTypeName}</option>
                ))}
              </Form.Select>
              {errors.expenseTypeId && <small className="text-danger">{errors.expenseTypeId}</small>}
            </Col>

            {/* Expense Date */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[1].rules.label} <span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" name="createdOn" value={formData.createdOn} onChange={handleChange} onBlur={() => validateField("createdOn", formData.createdOn)} />
              {errors.createdOn && <small className="text-danger">{errors.createdOn}</small>}
            </Col>

            {/* Amount */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[2].rules.label} <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="amount" value={formData.amount} onChange={handleChange} onBlur={() => validateField("amount", formData.amount)} />
              {errors.amount && <small className="text-danger">{errors.amount}</small>}
            </Col>

            {/* Payment Mode */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[3].rules.label} <span className="text-danger">*</span></Form.Label>
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
              {errors.paymentMode && <small className="text-danger">{errors.paymentMode}</small>}
            </Col>

            {/* Related Entity Type */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[4].rules.label} <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="relatedEntityType" value={formData.relatedEntityType} onChange={handleChange} onBlur={() => validateField("relatedEntityType", formData.relatedEntityType)} />
              {errors.relatedEntityType && <small className="text-danger">{errors.relatedEntityType}</small>}
            </Col>

            {/* Related Entity ID */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">{fields[5].rules.label} <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="relatedEntityId" value={formData.relatedEntityId} onChange={handleChange} onBlur={() => validateField("relatedEntityId", formData.relatedEntityId)} />
              {errors.relatedEntityId && <small className="text-danger">{errors.relatedEntityId}</small>}
            </Col>

            {/* Remarks */}
            <Col md={12} className="mb-3">
              <Form.Label className="fw-semibold">{fields[6].rules.label}</Form.Label>
              <Form.Control as="textarea" rows={3} name="remark" value={formData.remark} onChange={handleChange} />
            </Col>
          </Row>

          {/* Buttons */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>Update</Button>
          </div>

          {/* Attachments */}
          <Row className="mb-2">
            <Col xs={12}>
              <Attachments tableName="expense" recordId={recordId} />
            </Col>
          </Row>

          {/* Audit Trails */}
          <div>
            <AuditTrailsComponent tableName={tableName} recordId={recordId} />
          </div>
        </Form>
      </Container>

      <Toaster position="top-right" />
    </>
  );
};

export default ExpenseEdit;
