import React from "react";
import { useNavigate } from "react-router-dom";
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
  showBackButton?:boolean
}

const KiduServerInvoiceList: React.FC<KiduServerInvoiceListProps> = ({
  title,
  subtitle,
  fetchMode,
  showAddButton = true,
  showInvoiceButton = false,
  showCustomerPopUp = false,
  showSearch = true,
  showBackButton = true
}) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const columns = [
    { key: "tripCode", label: "Trip ID" },
    { key: "vehicleTakeOfTimeString", label: "Vehicle Take-off time" },
    { key: "fromDateString", label: "Departure Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "recivedVia", label: "Received Via" },
    { key: "driverName", label: "Driver" },
    { key: "pickUpFrom", label: "Pickup From" },
    { key: "status", label: "Status" } // 
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
      pagesize: pageSize,
      pagenumber: pageNumber,
    });

    console.log("API Response:", response);
    console.log("List Type:", listType);
    console.log("Customer ID:", customerId);

    if (response.isSucess && response.value) {
      console.log("Data:", response.value.data);

      if (response.value.data.length > 0) {
        console.log("First item fields:", Object.keys(response.value.data[0]));
        console.log("First item tripStatus:", response.value.data[0].tripStatus);
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
      idKey="tripOrderId"
      addButtonLabel="Add New Trip"
      addRoute="/dashboard/trip-create"
      viewRoute="/dashboard/trip-view"
      editRoute="/dashboard/trip-edit"
      showAddButton={showAddButton}
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
      onRowClick={(trip) => navigate(`/trips/view/${trip.tripOrderId}`)}
    />
  );
};

export default KiduServerInvoiceList;