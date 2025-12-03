import React from "react";
import KiduServerTripList from "../../../components/Trip/KiduTripList";

const UninvoicedTrips: React.FC = () => (
  <KiduServerTripList
    key="uninvoiced-trips" // Add unique key
    title="Uninvoiced Trips"
    subtitle="List of all uninvoiced trips that are completed"
    fetchMode="uninvoiced"
    showAddButton={false}
    showInvoiceButton={true}
    showCustomerPopUp={true}
    showSearch={false}
    showBackButton={true}
  />
);

export default UninvoicedTrips;