// src/services/TripKilometerService.ts

import HttpService from "../services/common/HttpService";
import type { CustomResponse } from "../types/common/ApiTypes";
import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import type { TripKilometer, TripKilometerCreateRequest } from "../types/TripKilometer.types";

class TripKilometerService {
  static async getAll(): Promise<CustomResponse<TripKilometer[]>> {
    return HttpService.callApi(API_ENDPOINTS.TRIP_KILOMETER.GET_ALL, "GET");
  }

  static async getById(id: number): Promise<CustomResponse<TripKilometer>> {
    return HttpService.callApi(API_ENDPOINTS.TRIP_KILOMETER.GET_BY_ID(id), "GET");
  }

  // static async getByTripId(tripId: number): Promise<CustomResponse<TripKilometer[]>> {
  //   return HttpService.callApi(`${API_ENDPOINTS.TRIP_KILOMETER.GET_ALL}?tripOrderId=${tripId}`, "GET");
  // }
  static async getByTripId(tripId: number): Promise<CustomResponse<TripKilometer[]>> {
  return HttpService.callApi(
    `${API_ENDPOINTS.TRIP_KILOMETER.GET_BY_TRIP_ID}?tripOrderId=${tripId}`,
    "GET"
  );
}


  static async create(data: TripKilometerCreateRequest): Promise<CustomResponse<TripKilometer>> {
    return HttpService.callApi(API_ENDPOINTS.TRIP_KILOMETER.CREATE, "POST", data);
  }

  static async update(id: number, data: TripKilometerCreateRequest): Promise<CustomResponse<TripKilometer>> {
    return HttpService.callApi(API_ENDPOINTS.TRIP_KILOMETER.UPDATE(id), "PUT", data);
  }

  static async delete(id: number): Promise<CustomResponse<null>> {
    return HttpService.callApi(API_ENDPOINTS.TRIP_KILOMETER.DELETE(id), "DELETE");
  }
}

export default TripKilometerService;