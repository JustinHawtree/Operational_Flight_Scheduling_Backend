export default interface Flight {
  flight_uuid: string;
  aircraft_uuid: string;
  location_uuid: string;
  start: string;
  end: string;
  color: string;
  title: string;
  description: string;
  allDay: boolean;
}

export const validFlightUpdateProps: Array<string> = ["aircraft_uuid", "location_uuid",
  "start", "end", "color", "title", "description", "allDay"];

export const baseFlightData: string =
  `SELECT FT.flight_uuid, location_uuid, aircraft_uuid, start, end, color, title, description, allDay as "allDay",
    COALESCE (array_agg( json_build_object('airman_uuid', FC.account_uuid, 'crew_position_uuid', FC.crew_position_uuid))
      FILTER (WHERE FC.flight_crew_uuid IS NOT NULL), array[]::json[]) as crew_members
    FROM flight FT
    LEFT OUTER JOIN flight_crew FC
    ON FT.flight_uuid = FC.flight_uuid `

export const flightGroupBy: string =
  `GROUP BY FT.flight_uuid, FT.start, FT.end, FT.color, FT.title, FT.description, location_uuid, aircraft_uuid`;
