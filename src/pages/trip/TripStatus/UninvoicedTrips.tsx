import React from "react";
import { useNavigate } from "react-router-dom";
import KiduServerTripList from "../../../components/Trip/KiduTripList";
import InvoiceMasterService from "../../../services/Invoice.services";
import toast, { Toaster } from "react-hot-toast";

const UninvoicedTrips: React.FC = () => {
  const navigate = useNavigate();

  const handleGenerateInvoice = async (
    selectedIds: string[],
    customerId?: number
  ) => {
    if (!customerId) {
      toast.error("Customer ID is required");
      return;
    }

    try {
      const tripOrderIds = selectedIds.map((id) => parseInt(id, 10));
      console.log("Generating invoice with:", { tripOrderIds, customerId });

      const response = await InvoiceMasterService.generateInvoice({
        tripOrderIds,
        customerId,
      });
      console.log(response);
      console.log("API RESPONSE:", response);
      console.log("response.value:", response.value);
      console.log("response.error:", response.error);

      if (response.isSucess && response.value) {
        console.log("Invoice generated successfully:", response.value);

        // Navigate to create invoice page with the generated data
        navigate("/dashboard/invoice-management/create-invoice", {
          state: {
            invoiceData: response.value,
            tripOrderIds,
            customerId,
          },
        });
      } else {
        throw new Error(response.error || "Failed to generate invoice");
      }
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      alert(`Failed to generate invoice: ${error.message}`);
    }
  };

  return (
    <>
      <KiduServerTripList
        key="uninvoiced-trips"
        title="Uninvoiced Trips"
        subtitle="List of all uninvoiced trips that are completed"
        fetchMode="uninvoiced"
        showAddButton={false}
        showInvoiceButton={true}
        showCustomerPopUp={true}
        showSearch={false}
        showBackButton={true}
        onGenerateInvoice={handleGenerateInvoice}
      />
       <Toaster position="top-right" />
    </>
  );
};

export default UninvoicedTrips;