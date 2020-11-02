export default interface FlightCrew{
  flight_crew_uuid: string;
  flight_uuid: string;
  account_uuid: string;
  crew_position_uuid: string;
}

export const validFlightCrewUpdateProps: Array<string> = ["flight_uuid", "account_uuid", "crew_position_uuid"];

export const baseFlightCrewData: string =
  `SELECT flight_crew_uuid, flight_uuid, account_uuid, crew_position_uuid FROM flight_crew `;

