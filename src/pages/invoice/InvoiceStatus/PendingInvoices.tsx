import React from "react";
import KiduServerInvoiceList from "../../../components/Invoice/KiduInvoiceList";

const PendingInvoices: React.FC = () => (
    <KiduServerInvoiceList
        key="pending-invoices" // Add unique key
        title="Pending Invoices"
        subtitle="List of all pending invoices"
        fetchMode="pending"
        showAddButton={false}
        showBackButton={true}
    />
);

export default PendingInvoices;