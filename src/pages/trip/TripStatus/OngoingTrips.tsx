import React from "react";
import KiduServerTripList from "../../../components/Trip/KiduTripList";

const OngoingTrips: React.FC = () => (
  <KiduServerTripList
    key="ongoing-trips" // Add unique key
    title="Ongoing Trips"
    subtitle="List of trips that are ongoing with quick edit & view actions"
    fetchMode="status"
    status="ongoing"
    showAddButton={false}
  />
);

export default OngoingTrips;
