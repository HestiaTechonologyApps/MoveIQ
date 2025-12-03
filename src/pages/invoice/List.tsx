// import React, { useCallback } from "react";
// import InvoiceService from "../../services/Invoice.services";
// import KiduServerTable from "../../components/Trip/KiduServerTable";

// const InvoiceList: React.FC = () => {
//   const columns = [
//     { key: "invoiceNumber", label: "Invoice No" },
//     { key: "customerName", label: "Customer" },
//     { key: "invoiceDate", label: "Invoice Date" },
//     { key: "dueDate", label: "Due Date" },
//     { key: "totalAmount", label: "Total Amount" },
//     { key: "taxAmount", label: "Tax Amount" },
//     { key: "grandTotal", label: "Grand Total" },
//     { key: "status", label: "Status" }
//   ];

//   // Fetch data for the server table
//   const fetchInvoiceData = useCallback(async (params: {
//     pageNumber: number;
//     pageSize: number;
//     searchTerm: string;
//   }) => {
//     try {
//       console.log("📋 Fetching invoice data with params:", params);
      
//       // For now, using getAll since we don't have paginated endpoint
//       const response = await InvoiceService.getAll();
      
//       if (response.isSucess && response.value) {
//         let filteredData = response.value;
        
//         // Client-side filtering for search (replace with server-side when available)
//         if (params.searchTerm) {
//           const searchLower = params.searchTerm.toLowerCase();
//           filteredData = filteredData.filter((invoice: any) =>
//             invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
//             invoice.customerName?.toLowerCase().includes(searchLower) ||
//             invoice.status?.toLowerCase().includes(searchLower)
//           );
//         }
        
//         // Client-side pagination (replace with server-side when available)
//         const startIndex = (params.pageNumber - 1) * params.pageSize;
//         const endIndex = startIndex + params.pageSize;
//         const paginatedData = filteredData.slice(startIndex, endIndex);
        
//         return {
//           data: paginatedData,
//           total: filteredData.length
//         };
//       } else {
//         throw new Error(response.customMessage || "Failed to fetch invoices");
//       }
//     } catch (error: any) {
//       console.error("❌ Error fetching invoices:", error);
//       throw new Error(error.message || "Failed to load invoice data");
//     }
//   }, []);

//   // Handle download of selected invoices
//   // const handleDownloadSelected = async (selectedIds: number[]) => {
//   //   try {
//   //     console.log("📥 Downloading selected invoices:", selectedIds);
      
//   //     if (selectedIds.length === 0) {
//   //       toast.error("Please select at least one invoice to download");
//   //       return;
//   //     }
      
//   //     const loadingToast = toast.loading(`Downloading ${selectedIds.length} invoice(s)...`);
      
//   //     // Download each invoice individually
//   //     for (const invoiceId of selectedIds) {
//   //       try {
//   //         await downloadSingleInvoice(invoiceId);
//   //         // Small delay to avoid overwhelming the server
//   //         await new Promise(resolve => setTimeout(resolve, 300));
//   //       } catch (error) {
//   //         console.error(`Failed to download invoice ${invoiceId}:`, error);
//   //         // Continue with other invoices even if one fails
//   //       }
//   //     }
      
//   //     toast.success(`Download initiated for ${selectedIds.length} invoice(s)`, {
//   //       id: loadingToast
//   //     });
      
//   //   } catch (error: any) {
//   //     console.error("❌ Error in download process:", error);
//   //     toast.error("Failed to download selected invoices");
//   //   }
//   // };

//   // Download single invoice (helper function)
//   // const downloadSingleInvoice = async (invoiceId: number) => {
//   //   try {
//   //     // If you have a dedicated download endpoint, use it:
//   //     // const response = await InvoiceService.downloadInvoice(invoiceId);
      
//   //     // For now, we'll simulate download by opening view page
//   //     // You can replace this with actual PDF download logic
//   //     window.open(`/dashboard/view-invoice/${invoiceId}`, '_blank');
      
//   //   } catch (error) {
//   //     console.error(`Failed to download invoice ${invoiceId}:`, error);
//   //     throw error;
//   //   }
//   // };

//   // Handle individual row click
//   const handleRowClick = (invoice: any) => {
//     console.log("Invoice clicked:", invoice);
//     // Navigate to view page when row is clicked
//     // navigate(`/dashboard/view-invoice/${invoice.invoiceId}`);
//     window.open(`/dashboard/view-invoice/${invoice.invoiceId}`, '_blank');
//   };

//   return (
//     <KiduServerTable
//       title="Invoice Management"
//       subtitle="Manage and track all your invoices in one place"
//       columns={columns}
//       idKey="invoiceId"
//       addButtonLabel="Create Invoice"
//       addRoute="/dashboard/invoice-create"
//       editRoute="/dashboard/invoice-edit"
//       viewRoute="/dashboard/view-invoice"
//       // showCheckboxes={true} // THIS ENABLES THE CHECKBOX COLUMN
//       // onDownloadSelected={handleDownloadSelected}
//       // downloadButtonLabel="Download Invoices"
//       fetchData={fetchInvoiceData}
//       onRowClick={handleRowClick}
//       showExport={true}
//       rowsPerPage={10}
//       showSearch={true}
//       showActions={true}
//     />
//   );
// };

// export default InvoiceList;