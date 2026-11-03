import { Vehicle } from '../entities/vehicle.entity.js';
import { VehicleCondition, VehicleStatus } from '../enums/vehicle.enum.js';

export type PublicVehicle = {
  id: string;
  company_uuid: string;
  license_plate: string;
  engine_number: string;
  chassis_number: string;
  seat_count: number;
  model_code: string;
  vehicle_kind: string;
  color: string;
  payload: number;
  initial_odometer: number;
  brand: string;
  manufacture_year: number | null;
  manufacture_country: string;
  service_life_year: number | null;
  owner_name: string;
  registration_date: string | null;
  office_uuid: string | null;
  office: { id: string; office_code: string; name: string } | null;
  condition: VehicleCondition;
  status: VehicleStatus;
  created_at: Date;
  updated_at: Date;
};

export function normalizeLicensePlate(value: string) {
  return value.trim().toUpperCase();
}

export function toPublicVehicle(vehicle: Vehicle): PublicVehicle {
  return {
    id: vehicle.uuid,
    company_uuid: vehicle.company.uuid,
    license_plate: vehicle.license_plate,
    engine_number: vehicle.engine_number,
    chassis_number: vehicle.chassis_number,
    seat_count: vehicle.seat_count,
    model_code: vehicle.model_code,
    vehicle_kind: vehicle.vehicle_kind,
    color: vehicle.color,
    payload: vehicle.payload,
    initial_odometer: vehicle.initial_odometer,
    brand: vehicle.brand,
    manufacture_year: vehicle.manufacture_year,
    manufacture_country: vehicle.manufacture_country,
    service_life_year: vehicle.service_life_year,
    owner_name: vehicle.owner_name,
    registration_date: vehicle.registration_date,
    office_uuid: vehicle.office?.uuid ?? null,
    office: vehicle.office
      ? {
          id: vehicle.office.uuid,
          office_code: vehicle.office.office_code,
          name: vehicle.office.name,
        }
      : null,
    condition: vehicle.condition,
    status: vehicle.status,
    created_at: vehicle.created_at,
    updated_at: vehicle.updated_at,
  };
}
