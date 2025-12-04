import type { AuditTrails } from "./common/AuditLog.types";

export interface Trip {
    tripModeName: any;
    tripOrderId: number;
    tripOrder?: string;
    tripCode?:string;
    tripBookingModeId: number;
    tripBookingModeName?:string,
    recivedVia?: string;
    customerId: number;
    driverId: number;
    fromDate: string | null;
    fromDateString: string | null;
    toDate: string | null;
    toDateString: string | null;
    fromLocation: string;
    vehicleTakeOfTime?:string | null;
    vehicleTakeOfTimeString?:string | null;
    pickUpFrom?: string;
    toLocation1: string;
    toLocation2: string;
    toLocation3: string;
    toLocation4: string;
    bookedBy: string;
    tripDetails: string;
    tripStatus: string;
    tripAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    isActive: boolean;
    paymentMode: string;
    paymentDetails: string;
    customerName: string;
    driverName: string;
    departmentName?:string;
    commaSeperatedToLocations?:string;
    auditLogs?: AuditTrails[];
}

export interface TripStatus {
    tripOrderId: number;
    tripStatus: string;
    remark: string;

}
export interface TripBookingMode {
    tripBookingModeId: number;
    tripBookingModeName: string;
    tripModeName?: string;

}
