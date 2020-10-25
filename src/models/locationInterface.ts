export interface Location {
  location_uuid: string;
  location_name: string;
  track_num: number;
}

export const validAircraftUpdateProps: Array<string> = ["location_name", "track_num"];

export const baseAircraftData: string = "SELECT location_uuid, location_name, track_num FROM location";
