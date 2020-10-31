export default interface Aircraft {
  aircraft_uuid: string;
  model_uuid: string;
  status: string;
}

export const validAircraftUpdateProps: Array<string> = ["status"];

export const baseAircraftData: string = "SELECT aircraft_uuid, model_uuid, status FROM aircraft ";
