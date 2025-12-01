import React from "react";
import { useNavigate } from "react-router-dom";
import TripService from "../../services/Trip.services";
import KiduServerTable from "../../components/Trip/KiduServerTable";

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

const TripList: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const fetchData = async ({
    pageNumber,
    pageSize,
    searchTerm,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    const response = await TripService.getPaginatedTrips({
      year: currentYear,
      customerId: 0,
      listType: "all",
      filtertext: searchTerm || "",
      pagesize: pageSize,
      pagenumber: pageNumber,
    });

    console.log("API Response:", response);

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
      title="Total Trips"
      subtitle="List of all trips with quick edit & view actions"
      columns={columns}
      idKey="tripOrderId"
      addButtonLabel="Add New Trip"
      addRoute="/dashboard/trip-create"
      viewRoute="/dashboard/trip-view"
      editRoute="/dashboard/trip-edit"
      showAddButton={true}
      showExport={true}
      showSearch={true}
      showActions={true}
      showTitle={true}
      fetchData={fetchData}
      rowsPerPage={10}
      onRowClick={(trip) => navigate(`/dashboard/trip-view/${trip.tripOrderId}`)}
    />
  );
};

export default TripList;