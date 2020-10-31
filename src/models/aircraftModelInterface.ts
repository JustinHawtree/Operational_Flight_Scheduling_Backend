export default interface AircraftModel {
  model_uuid: string;
  model_name: string;
}

export const validAircraftModelUpdateProps: Array<string> = ["model_name"];

export const baseAircraftModelData: string = 
  `SELECT AM.model_uuid, AM.model_name,
    COALESCE (ARRAY_AGG( JSON_BUILD_OBJECT('crew_position_uuid', CP.crew_position_uuid)
      ORDER BY MP.position_order ASC) FILTER (WHERE CP.crew_position_uuid IS NOT NULL), array[]::json[]) as positions
    FROM aircraft_model AM
    LEFT OUTER JOIN model_position MP
    ON AM.model_uuid = MP.model_uuid
    LEFT OUTER JOIN crew_position CP
    ON MP.crew_position_uuid = CP.crew_position_uuid `;
