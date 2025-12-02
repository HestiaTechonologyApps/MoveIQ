import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import type { CustomResponse } from "../types/common/ApiTypes";
import type { CustomerDepartment } from "../types/CustomerDepartment.types";
import HttpService from "./common/HttpService";

class CustomerDepartmentService {

  static async getAll(): Promise<CustomResponse<CustomerDepartment[]>> {
    return HttpService.callApi(API_ENDPOINTS.CUSTOMERDEPARTMENT.GET_ALL, "GET");
  }

}

export default CustomerDepartmentService;
