// src/services/InvoiceMasterService.ts
import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import type { CustomResponse } from "../types/common/ApiTypes";
import type {CreateInvoiceRequest, GenerateInvoiceRequest, InvoiceDashboardCard, InvoiceMaster, UpdateInvoiceRequest } from "../types/Invoice.types";
import type { ServersideTrip } from "../types/ServerSideTrip.types";
import HttpService from "./common/HttpService";

class InvoiceMasterService {
  static async getInvoiceDashboard(year: number): Promise<CustomResponse<InvoiceDashboardCard[]>> {
     return HttpService.callApi(API_ENDPOINTS.INVOICE_DASHBOARD.GET_ALL(year), "GET");
   } 

   static async getPaginatedInvoices(data: ServersideTrip): Promise<CustomResponse<any>> {
       return HttpService.callApi(API_ENDPOINTS.SERVER_SIDE_INVOICE.GET_PAGINATED_INVOICE, "POST", data);
     }

     static async getAllInvoices(): Promise<CustomResponse<InvoiceMaster[]>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.GET_ALL, "GET");
  }

  static async getInvoiceById(
    id: number
  ): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(
      API_ENDPOINTS.INVOICE_MASTER.GET_BY_ID(id),
      "GET"
    );
  }

  static async createInvoice(
    data: CreateInvoiceRequest
  ): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(
      API_ENDPOINTS.INVOICE_MASTER.CREATE,
      "POST",
      data
    );
  }

   static async updateInvoice(
    id: number,
    data: UpdateInvoiceRequest
  ): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(
      API_ENDPOINTS.INVOICE_MASTER.UPDATE(id),
      "PUT",
      data
    );
  }

  static async deleteInvoice(id: number): Promise<CustomResponse<void>> {
    return HttpService.callApi(
      API_ENDPOINTS.INVOICE_MASTER.DELETE(id),
      "DELETE"
    );
  }

  static async generateInvoice(
    data: GenerateInvoiceRequest
  ): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(
      API_ENDPOINTS.INVOICE_MASTER.GENERATE_INVOICE,
      "POST",
      data
    );
  }
}

export default InvoiceMasterService;
