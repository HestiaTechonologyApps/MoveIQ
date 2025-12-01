import React from "react";
import { useNavigate } from "react-router-dom";
import TripService from "../../services/Trip.services";
import KiduServerTable from "./KiduServerTable";

interface KiduServerTripListProps {
  title: string;
  subtitle?: string;
  fetchMode: "all" | "today" | "status";
  status?: "Scheduled" | "Completed" | "Canceled";
  showAddButton?: boolean;
}

const KiduServerTripList: React.FC<KiduServerTripListProps> = ({
  title,
  subtitle,
  fetchMode,
  status,
  showAddButton = true,
}) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Updated columns to match the fields you want to display
  const columns = [
    { key: "tripCode", label: "Trip ID" },
    { key: "vehicleTakeOfTimeString", label: "Vehicle Take-off time" },
    { key: "fromDateString", label: "Departure Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "recivedVia", label: "Received Via" },
    { key: "driverName", label: "Driver" },
    { key: "pickUpFrom", label: "Pickup From" },
    { key: "status", label: "Status" }
  ];

  const fetchData = async ({
    pageNumber,
    pageSize,
    searchTerm,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    let listType = "";
    
    // Determine listType based on fetchMode
    if (fetchMode === "all") {
      listType = "all";
    } else if (fetchMode === "today") {
      listType = "today";
    } else if (fetchMode === "status" && status) {
      listType = status; // "Scheduled", "Completed", or "Canceled"
    }

    const response = await TripService.getPaginatedTrips({
      year: currentYear,
      customerId: 0,
      listType: listType,
      filtertext: searchTerm || "",
      pagesize: pageSize,
      pagenumber: pageNumber,
    });

    console.log("API Response:", response);
    console.log("List Type:", listType);

    if (response.isSucess && response.value) {
      console.log("Data:", response.value.data);
      
      // Check if the first item has the fields you want
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
      idKey="tripOrderId"
      addButtonLabel="Add Trip"
      addRoute="/trips/add"
      viewRoute="/dashboard/trip-view"
      editRoute="/dashboard/trip-edit"
      showAddButton={showAddButton}
      showExport={true}
      showSearch={true}
      showActions={true}
      showTitle={true}
      fetchData={fetchData}
      rowsPerPage={10}
      onRowClick={(trip) => navigate(`/trips/view/${trip.tripOrderId}`)}
    />
  );
};

export default KiduServerTripList;