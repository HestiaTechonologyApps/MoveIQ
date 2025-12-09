import React from "react";
import { useNavigate } from "react-router-dom";
import TripService from "../../services/Trip.services";
import KiduServerTable from "./KiduServerTable";

interface KiduServerTripListProps {
  title: string;
  subtitle?: string;
  fetchMode: "all" | "today" | "status" | "uninvoiced";
  status?: "Scheduled" | "Completed" | "Canceled" | "ongoing" | "upcoming";
  showAddButton?: boolean;
  showInvoiceButton?: boolean
  showCustomerPopUp?: boolean
  showSearch?: boolean
  showBackButton?: boolean
  onGenerateInvoice?: (selectedIds: string[], customerId?: number) => void;
}

const KiduServerTripList: React.FC<KiduServerTripListProps> = ({
  title,
  subtitle,
  fetchMode,
  status,
  showAddButton = true,
  showInvoiceButton = false,
  showCustomerPopUp = false,
  showSearch = true,
  showBackButton = false,
   onGenerateInvoice,
}) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Show start button only for upcoming trips
  const showStartButton = fetchMode === "status" && status === "upcoming";

  // Show checkbox only for uninvoiced trips
  const showCheckbox = fetchMode === "uninvoiced";

  const columns = [
    { key: "tripCode", label: "Trip ID" },
    { key: "vehicleTakeOfTimeString", label: "Vehicle Take-off time" },
    { key: "fromDateString", label: "Departure Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "recivedVia", label: "Received Via" },
    { key: "driverName", label: "Driver" },
    { key: "pickUpFrom", label: "Pickup From" },
    { key: "commaSeperatedToLocations", label: "Drop Location" },
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

    if (fetchMode === "all") {
      listType = "all";
    } else if (fetchMode === "today") {
      listType = "today";
    } else if (fetchMode === "uninvoiced") {
      listType = "uninvoiced";
    } else if (fetchMode === "status" && status) {
      listType = status;
    }

    const response = await TripService.getPaginatedTrips({
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

  // Handler for starting a trip
  const handleStartTrip = async (trip: any) => {
    try {
      console.log("🚀 Starting trip:", trip.tripOrderId);

      // Call the update status API with correct property names
      await TripService.updatestatus({
        tripOrderId: trip.tripOrderId,
        tripStatus: "Started", // ✅ Changed from "status" to "tripStatus"
        remark: "Trip started from upcoming list" // ✅ Added required remark field
      });

      console.log("✅ Trip started successfully");
      // Table will auto-reload after this function completes
    } catch (error) {
      console.error("❌ Failed to start trip:", error);
      throw error;
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
      showBackButton={showBackButton}
      showInvoiceButton={showInvoiceButton}
      showCustomerPopUp={showCustomerPopUp}
      showCheckbox={showCheckbox}
      showExport={true}
      showSearch={showSearch}
      showActions={true}
      showTitle={true}
      fetchData={fetchData}
      rowsPerPage={10}
      showStartButton={showStartButton}
      onStartTrip={showStartButton ? handleStartTrip : undefined}
      onGenerateInvoice={onGenerateInvoice}
      onRowClick={(trip) => navigate(`/dashboard/trip-view/${trip.tripOrderId}`)}
    />
  );
};

export default KiduServerTripList;
