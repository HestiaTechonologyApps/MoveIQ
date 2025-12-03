// src/services/InvoiceMasterService.ts
import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import type { CustomResponse } from "../types/common/ApiTypes";
import type {InvoiceDashboardCard } from "../types/Invoice.types";
import type { ServersideTrip } from "../types/ServerSideTrip.types";
import HttpService from "./common/HttpService";

class InvoiceMasterService {
  static async getInvoiceDashboard(year: number): Promise<CustomResponse<InvoiceDashboardCard[]>> {
     return HttpService.callApi(API_ENDPOINTS.INVOICE_DASHBOARD. GET_ALL(year), "GET");
   } 

   static async getPaginatedInvoices(data: ServersideTrip): Promise<CustomResponse<any>> {
       return HttpService.callApi(API_ENDPOINTS. SERVER_SIDE_INVOICE.GET_PAGINATED_INVOICE, "POST", data);
     }
}

export default InvoiceMasterService;
