import React from "react";
import KiduServerTripList from "../../../components/Trip/KiduTripList";

const UpcomingTrips: React.FC = () => (
  <KiduServerTripList
    key="upcoming-trips" // Add unique key
    title="Upcoming Trips"
    subtitle="List of trips that are upcoming with quick edit & view actions"
    fetchMode="status"
    status="Upcoming"
    showAddButton={false}
  />
);

export default UpcomingTrips;