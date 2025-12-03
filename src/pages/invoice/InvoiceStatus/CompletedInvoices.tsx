import React from "react";
import KiduServerInvoiceList from "../../../components/Invoice/KiduInvoiceList";

const CompletedInvoices: React.FC = () => (
    <KiduServerInvoiceList
        key="completed-invoices" // Add unique key
        title="Completed Invoices"
        subtitle="List of all completed invoices"
        fetchMode="completed"
        showAddButton={false}
        showBackButton={true}
    />
);

export default CompletedInvoices;