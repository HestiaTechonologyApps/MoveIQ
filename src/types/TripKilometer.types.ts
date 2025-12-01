// src/types/TripKilometer.types.ts

export interface TripKilometer {
  tripKiloMeterId: number;
  tripOrderId: number;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleName: string;
  tripStartTime: string;
  tripStartTimeString: string;
  tripEndTime: string;
  tripEndingTimeString: string;
  tripStartReading: number;
  tripEndReading: number;
  totalKM: number;
  waitingHours?:string;
  createdOn: string;
  createdOnString: string;
  auditLogs: any[];
}

export interface TripKilometerCreateRequest {
  tripKiloMeterId: number;
  tripOrderId: number;
  driverId: number;
  vehicleId: number;
  tripStartTime: string;
  tripEndTime: string;
  tripStartReading: number;
  tripEndReading: number;
  totalKM: number;
  createdOn: string;
}