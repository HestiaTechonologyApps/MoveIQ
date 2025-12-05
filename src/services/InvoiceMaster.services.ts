// src/services/InvoiceMasterService.ts
import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import type { CustomResponse } from "../types/common/ApiTypes";
import type { InvoiceMaster } from "../types/InvoiceMaster.types";
import HttpService from "./common/HttpService";

class InvoiceMasterService {
  static async getAll(): Promise<CustomResponse<InvoiceMaster[]>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.GET_ALL, "GET");
  }

  static async getById(id: number): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.GET_BY_ID(id), "GET");
  }

  static async create(data: InvoiceMaster): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.CREATE, "POST", data);
  }

  static async update(id: number, data: InvoiceMaster): Promise<CustomResponse<InvoiceMaster>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.UPDATE(id), "PUT", data);
  }

  static async delete(id: number): Promise<CustomResponse<null>> {
    return HttpService.callApi(API_ENDPOINTS.INVOICE_MASTER.DELETE(id), "DELETE");
  }
}

export default InvoiceMasterService;
