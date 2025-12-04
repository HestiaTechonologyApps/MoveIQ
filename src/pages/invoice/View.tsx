// // src/Pages/InvoiceMaster/ViewInvoiceMaster.tsx

// import React, { useState, useEffect } from "react";
// import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import toast, { Toaster } from "react-hot-toast";
// import Attachments from "../../components/KiduAttachments";
// import AuditTrailsComponent from "../../components/KiduAuditLogs";
// import KiduLoader from "../../components/KiduLoader";
// import KiduPrevious from "../../components/KiduPrevious";
// import InvoiceMasterService from "../../services/Invoice.services";

// const ViewInvoice: React.FC = () => {
//   const navigate = useNavigate();
//   const { invoiceId } = useParams();

//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [loadingDelete, setLoadingDelete] = useState(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       try {
//         const res = await InvoiceMasterService.getById(Number(invoiceId));
//         if (res.isSucess && res.value) {
//           setData(res.value);
//         } else {
//           toast.error("Invoice not found.");
//         }
//       } catch {
//         toast.error("Failed to load invoice details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInvoice();
//   }, [invoiceId]);

//   if (loading) return <KiduLoader type="invoice details..." />;

//   if (!data)
//     return (
//       <div className="text-center mt-5">
//         <h5>No invoice details found.</h5>
//         <Button className="mt-3" onClick={() => navigate(-1)}>
//           Go Back
//         </Button>
//       </div>
//     );

//   // Fields displayed in table
//   const fields = [
//     { key: "invoiceNum", label: "Invoice Number" },
//     { key: "financialYearId", label: "Financial Year ID" },
//     { key: "companyId", label: "Company ID" },
//     { key: "totalAmount", label: "Total Amount" },
//     {
//       key: "createdOnString",
//       label: "Created On",
//       format: (value: string) =>
//         value
//           ? new Date(value).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "long",
//               year: "numeric",
//             })
//           : "-",
//     },
//   ];

//   const handleEdit = () =>
//     navigate(`/dashboard/edit-invoice/${data.invoicemasterId}`);

//   const handleDelete = async () => {
//     setLoadingDelete(true);
//     try {
//       await InvoiceMasterService.delete(data.invoicemasterId);
//       toast.success("Invoice deleted successfully");

//       setTimeout(() => navigate("/dashboard/invoice-list"), 800);
//     } catch {
//       toast.error("Failed to delete invoice.");
//     } finally {
//       setLoadingDelete(false);
//       setShowConfirm(false);
//     }
//   };

//   return (
//     <div
//       className="container d-flex justify-content-center align-items-center mt-5"
//       style={{ fontFamily: "Urbanist" }}
//     >
//       <Card
//         className="shadow-lg p-4 w-100"
//         style={{
//           maxWidth: "1300px",
//           borderRadius: "15px",
//           border: "none",
//         }}
//       >
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <div className="d-flex align-items-center">
//             <KiduPrevious />
//             <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>
//               Invoice Details
//             </h5>
//           </div>

//           <div className="d-flex">
//             <Button
//               className="d-flex align-items-center gap-2 me-1"
//               style={{
//                 fontWeight: 500,
//                 backgroundColor: "#18575A",
//                 fontSize: "15px",
//                 border: "none",
//               }}
//               onClick={handleEdit}
//             >
//               <FaEdit /> Edit
//             </Button>

//             <Button
//               variant="danger"
//               className="d-flex align-items-center gap-2"
//               style={{ fontWeight: 500, fontSize: "15px" }}
//               onClick={() => setShowConfirm(true)}
//             >
//               <FaTrash size={12} /> Delete
//             </Button>
//           </div>
//         </div>

//         {/* Title Section */}
//         <div className="text-center mb-4">
//           <h5 className="fw-bold mb-1">Number : {data.invoiceNum}</h5>
//           <p
//             className="small mb-0 fw-bold text-danger"
//             style={{ color: "#18575A" }}
//           >
//              {data.invoicemasterId}
//           </p>
//         </div>

//         {/* Details Table */}
//         <div className="table-responsive">
//           <Table bordered hover responsive className="align-middle mb-0">
//             <tbody>
//               {fields.map(({ key, label, format }) => {
//                 let value = data[key];
//                 if (format) value = format(value);
//                 return (
//                   <tr key={key}>
//                     <td
//                       style={{
//                         width: "40%",
//                         fontWeight: 600,
//                         color: "#18575A",
//                       }}
//                     >
//                       {label}
//                     </td>
//                     <td>{String(value) || "-"}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//         </div>

//         <Attachments tableName="invoice" recordId={data.invoicemasterId} />
//         <AuditTrailsComponent
//           tableName="invoiceMaster"
//           recordId={data.invoicemasterId}
//         />
//       </Card>

//       {/* Delete Modal */}
//       <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           Are you sure you want to delete this invoice?
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowConfirm(false)}>
//             Cancel
//           </Button>

//           <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
//             {loadingDelete ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Deleting...
//               </>
//             ) : (
//               "Delete"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Toaster position="top-right" />
//     </div>
//   );
// };

// export default ViewInvoice;
