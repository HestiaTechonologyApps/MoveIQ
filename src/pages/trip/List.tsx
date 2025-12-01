import React, { useEffect, useState } from "react";
import TripService from "../../services/Trip.services";
import KiduServerTable from "../../components/KiduTable";
import KiduLoader from "../../components/KiduLoader";

const columns = [
  { key: "tripCode", label: "Trip ID" },
  { key: "vehicleTakeofTimeString", label: "Vehicle Take-Off Time" },
  { key: "fromDateString", label: "Departure Date" },
  { key: "customerName", label: "Customer Name" },
  { key: "recivedVia", label: "Received Via" },
  { key: "driverName", label: "Driver" },
  { key: "pickUpFrom", label: "Pickup From" },
  { key: "status", label: "Status" }
];

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await TripService.getAll();
      console.log("Trip API Response:", res);
      
      if (res.isSucess && res.value) {
        // Transform data to ensure consistent ID field
        const transformedTrips = res.value.map(trip => ({
          ...trip,
          id: trip.tripOrderId
        }));
        console.log("Transformed trips:", transformedTrips);
        setTrips(transformedTrips);
        setError(null);
      } else {
        setError("Failed to fetch trips");
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("An error occurred while fetching trips");
    } finally {
      setLoading(false);
    }
  };

  // Load data only once when component mounts
  useEffect(() => {
    loadData();
  }, []); // Empty dependency array - runs only once

  if (loading) return <KiduLoader type="trips..." />;

  return (
    <KiduServerTable
      title="Total Trips"
      subtitle="List of all trips with quick edit & view actions"
      columns={columns}
      data={trips}
      addButtonLabel="Add New Trip"
      addRoute="/dashboard/trip-create"
      editRoute="/dashboard/trip-edit"
      viewRoute="/dashboard/trip-view"
      idKey="id"
      error={error}
      onRetry={loadData}
    />
  );
};

export default TripList;