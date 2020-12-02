export default interface ModelPosition {
  model_position_uuid: string;
  model_uuid: string;
  crew_position_uuid: string;
  position_order: number;
}

export const validModelPositionUpdateProps: Array<string> = ["model_uuid", "crew_position_uuid", "position_order"];

export const baseModelPositionData: string = "SELECT model_position_uuid, model_uuid, crew_position, position_order FROM model_position";
