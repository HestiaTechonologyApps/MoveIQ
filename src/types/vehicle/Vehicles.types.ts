// src/types/Vehicle.types.ts

export interface Vehicle {
    vehicleId: number;
    registrationNumber: string;
    make: string;
    model: string;
    year: string;
    chassisNumber: string;
    engineNumber: string;
    vehicleType: string;
    registrationExpiry: string;
    insuranceExpiry?:string;
    insuranceExpiryString?:string;
    currentStatus: string;
    location: string;
}


