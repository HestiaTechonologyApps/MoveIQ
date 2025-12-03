import React from "react";
import KiduServerInvoiceList from "../../../components/Invoice/KiduInvoiceList";

const CanceledInvoices: React.FC = () => (
    <KiduServerInvoiceList
        key="canceled-invoices" // Add unique key
        title="Canceled Invoices"
        subtitle="List of all canceled invoices"
        fetchMode="canceled"
        showAddButton={false}
        showBackButton={true}
    />
);

export default CanceledInvoices;