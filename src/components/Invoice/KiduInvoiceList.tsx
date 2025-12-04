import React from "react";
import KiduServerTable from "../Trip/KiduServerTable";
import InvoiceMasterService from "../../services/Invoice.services";

interface KiduServerInvoiceListProps {
  title: string;
  subtitle?: string;
  fetchMode: "completed" | "pending" | "canceled";
  showAddButton?: boolean;
  showInvoiceButton?: boolean
  showCustomerPopUp?: boolean
  showSearch?: boolean
  showBackButton?: boolean
}

const KiduServerInvoiceList: React.FC<KiduServerInvoiceListProps> = ({
  title,
  subtitle,
  fetchMode,
  showInvoiceButton = false,
  showCustomerPopUp = false,
  showSearch = true,
  showBackButton = true
}) => {
  const currentYear = new Date().getFullYear();

  const columns = [
    { key: "invoiceMasterId", label: "Invoicemaster Id" },
    { key: "invoiceNum", label: "Invoice Number" },
    { key: "createdOnString", label: "Invoice Date" },
    { key: "companyName", label: "Company Name" },
    { key: "totalAmount", label: "Total Amount" },
  ];

  const fetchData = async ({
    pageNumber,
    pageSize,
    searchTerm,
    customerId = 0,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    customerId?: number;
  }) => {
    let listType = "";

    if (fetchMode === "completed") {
      listType = "completed";
    } else if (fetchMode === "pending") {
      listType = "pending";
    } else if (fetchMode === "canceled") {
      listType = "canceled";
    }

    const response = await InvoiceMasterService.getPaginatedInvoices({
      year: currentYear,
      customerId: customerId,
      listType: listType,
      filtertext: searchTerm || "",
      pagesize: pageSize || 10,
      pagenumber: pageNumber,
    });

    console.log("API Response:", response);
    console.log("List Type:", listType);
    console.log("Page Size:", pageSize);
    console.log("Customer ID:", customerId);

    if (response.isSucess && response.value) {
      console.log("Data:", response.value.data);

      if (response.value.data.length > 0) {
        console.log("First item fields:", Object.keys(response.value.data[0]));
      }

      return {
        data: response.value.data,
        total: response.value.total,
      };
    } else {
      throw new Error(response.error || "Failed to fetch trips");
    }
  };

  return (
    <KiduServerTable
      title={title}
      subtitle={subtitle}
      columns={columns}
      idKey="invoiceMasterId"
      viewRoute="/dashboard/invoice-management/view-invoice"
      editRoute="/dashboard/invoice-management/edit-invoice"
      showAddButton={false}
      showInvoiceButton={showInvoiceButton}
      showCustomerPopUp={showCustomerPopUp}
      showExport={true}
      showSearch={showSearch}
      showBackButton={showBackButton}
      showActions={true}
      showTitle={true}
      fetchData={fetchData}
      rowsPerPage={10}
      showStartButton={false}
    />
  );
};

export default KiduServerInvoiceList;