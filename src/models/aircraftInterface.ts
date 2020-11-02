export default interface Aircraft {
  aircraft_uuid: string;
  model_uuid: string;
  status: string;
  tail_code: string;
}

export const validAircraftUpdateProps: Array<string> = ["status", "tail_code"];

export const baseAircraftData: string = "SELECT aircraft_uuid, model_uuid, status, tail_code FROM aircraft ";
