import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaPen } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DriverService from "../../services/Driver.services";
import { KiduValidation } from "../../components/KiduValidation";
import KiduPrevious from "../../components/KiduPrevious";
import KiduLoader from "../../components/KiduLoader";
import Attachments from "../../components/KiduAttachments";
import AuditTrailsComponent from "../../components/KiduAuditLogs";
import KiduReset from "../../components/ReuseButtons/KiduReset";
import type { Driver } from "../../types/Driver.types";
import KiduPaymentAccordion from "../../components/KiduPaymentAccordion";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";
import defaultProfile from "../../assets/Images/profile.jpeg";
import KiduCommentAccordion from "../../components/KiduCommentAccordion";

const DriverEdit: React.FC = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const tableName = "Driver";
  const recordId = Number(driverId);

  const fields = [
    { name: "driverName", label: "Driver Name", rules: { required: true, type: "text" } },
    { name: "dob", label: "Date of Birth", rules: { required: true, type: "date" } },
    { name: "contactNumber", label: "Phone Number", rules: { required: true, type: "number", minLength: 10, maxLength: 10 } },
    { name: "nationality", label: "Nationality", rules: { required: true, type: "text" } },
    { name: "license", label: "License Number", rules: { required: true, type: "text", minLength: 5 } },
    { name: "nationalId", label: "IQAMA Number", rules: { required: true, type: "text", minLength: 5 } }
  ];

  useEffect(() => {
    const loadDriver = async () => {
      try {
        const res = await DriverService.getById(Number(driverId));
        if (res.isSucess && res.value) {
          const d = res.value;

          const loadedValues = {
            driverName: d.driverName || "",
            dob: d.dob ? d.dob.split("T")[0] : "",
            contactNumber: d.contactNumber || "",
            nationality: d.nationality || "",
            license: d.license || "",
            nationalId: d.nationalId || ""
          };

          setFormData(loadedValues);
          setInitialValues(loadedValues);

          const errObj: any = {};
          fields.forEach(f => errObj[f.name] = "");
          setErrors(errObj);

          // ✅ Load existing image using helper function
          const imageUrl = d.profileImagePath ? getFullImageUrl(d.profileImagePath) : defaultProfile;
          console.log("Driver loaded - Original path:", d.profileImagePath, "→ Full URL:", imageUrl);
          setImagePreview(imageUrl);

        } else {
          toast.error("Failed to load driver details");
          navigate("/dashboard/driver-list");
        }
      } catch (err: any) {
        console.error("Error loading driver:", err);
        toast.error(err.message);
        navigate("/dashboard/driver-list");
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId, navigate]);

  const handleChange = (e: any) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files && files.length > 0) {
      const file = files[0];
      setNewImageFile(file);

      // ✅ Only revoke blob URLs, not http URLs
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const blobUrl = URL.createObjectURL(file);
      console.log("New image selected, blob URL created:", blobUrl);
      setImagePreview(blobUrl);
      return;
    }

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
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();

      const age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();

      const isUnder18 = age < 18 || (age === 18 && m < 0);

      if (isUnder18) {
        toast.error("Driver must be at least 18 years old");
        return;
      }
    }
    if (!validateForm()) return;

    try {
      const driverData: Driver = {
        driverId: Number(driverId),
        driverName: formData.driverName,
        dob: formData.dob,
        dobString: formData.dob,
        contactNumber: formData.contactNumber,
        nationality: formData.nationality,
        license: formData.license,
        nationalId: formData.nationalId,
        isRented: false,
        isActive: true,
        auditLogs: [],
        profileImagePath: "",
      };

      const res = await DriverService.update(Number(driverId), driverData);

      if (res.isSucess) {
        // ✅ Upload new image only if a new file was selected
        if (newImageFile) {
          console.log("Uploading new profile picture...");
          const uploadRes = await DriverService.uploadProfilePic(Number(driverId), newImageFile);
          if (!uploadRes.isSucess) {
            console.error("Image upload failed:", uploadRes.error);
            toast.error("Driver updated but image upload failed");
          } else {
            console.log("Image uploaded successfully");
          }
        }

        toast.success("Driver updated successfully!");
        setTimeout(() => navigate("/dashboard/driver-list"), 1500);
      } else {
        toast.error(res.customMessage || res.error);
      }

    } catch (err: any) {
      console.error("Error updating driver:", err);
      toast.error(err.message);
    }
  };

  // ✅ Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) return <KiduLoader type="driver details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3"><KiduPrevious /></div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Edit Driver</h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>

            {/* IMAGE SECTION */}
            <Col xs={12} md={4} className="d-flex flex-column align-items-center mb-4">
              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <Image
                  src={imagePreview || defaultProfile}
                  roundedCircle
                  width={160}
                  height={160}
                  style={{ objectFit: "cover", border: "1px solid #ccc" }}
                  onError={(e: any) => {
                    console.error("Image load error, using default");
                    e.target.src = defaultProfile;
                  }}
                />

                <OverlayTrigger placement="bottom" overlay={<Tooltip>Upload Photo</Tooltip>}>
                  <label htmlFor="photoUpload"
                    style={{ position: "absolute", bottom: "5px", right: "5px", background: "#18575A", borderRadius: "50%", padding: "8px 11px", cursor: "pointer" }}>
                    <FaPen style={{ color: "#fff", fontSize: "14px" }} />
                  </label>
                </OverlayTrigger>

                <Form.Control type="file" id="photoUpload" name="photo"
                  onChange={handleChange} accept="image/*"
                  style={{ display: "none" }} />
              </div>
            </Col>

            {/* FORM FIELDS */}
            <Col xs={12} md={8}>
              <Row>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[0].label} {fields[0].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    placeholder="Enter driver name"
                    onChange={handleChange}
                    onBlur={() => validateField("driverName", formData.driverName)}
                  />
                  {errors.driverName && <small className="text-danger">{errors.driverName}</small>}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[1].label} {fields[1].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    onBlur={() => validateField("dob", formData.dob)}
                  />
                  {errors.dob && <small className="text-danger">{errors.dob}</small>}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[2].label} {fields[2].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    placeholder="Enter phone number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onBlur={() => validateField("contactNumber", formData.contactNumber)}
                  />
                  {errors.contactNumber && <small className="text-danger">{errors.contactNumber}</small>}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[3].label} {fields[3].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nationality"
                    placeholder="Enter nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    onBlur={() => validateField("nationality", formData.nationality)}
                  />
                  {errors.nationality && <small className="text-danger">{errors.nationality}</small>}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[4].label} {fields[4].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="license"
                    placeholder="Enter license number"
                    value={formData.license}
                    onChange={handleChange}
                    onBlur={() => validateField("license", formData.license)}
                  />
                  {errors.license && <small className="text-danger">{errors.license}</small>}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[5].label} {fields[5].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nationalId"
                    placeholder="Enter iqama number"
                    value={formData.nationalId}
                    onChange={handleChange}
                    onBlur={() => validateField("nationalId", formData.nationalId)}
                  />
                  {errors.nationalId && <small className="text-danger">{errors.nationalId}</small>}
                </Col>
              </Row>
            </Col>
          </Row>
          {/* BUTTONS */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>Update</Button>
          </div>

          {/* Attachments */}
          <Row className="mb-2">
            <Col xs={12}>
              <KiduCommentAccordion
                tableName="Driver"
                recordId={recordId}
              />
              <KiduPaymentAccordion
                relatedEntityId={recordId}
                relatedEntityType="driver"
                heading="Payment Details"
              />
              <Attachments tableName={tableName} recordId={recordId} />
            </Col>
          </Row>

          {/* Audit Logs */}
          <div>
            <AuditTrailsComponent tableName={tableName} recordId={recordId} />
          </div>

        </Form>
      </Container>

      <Toaster position="top-right" />
    </>
  );
};

export default DriverEdit;