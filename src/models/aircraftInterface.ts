export interface Aircraft {
  aircraft_uuid: string;
  model_uuid: string;
  aircraft_status: string;
}

export const validAircraftUpdateProps: Array<string> = ["aircraft_status"];

export const baseAircraftData: string = "SELECT aircraft_uuid, model_uuid, status FROM aircraft";
