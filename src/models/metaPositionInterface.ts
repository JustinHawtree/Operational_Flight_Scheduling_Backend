export default interface MetaPosition {
  meta_position_uuid: string;
  meta_name: string;
  crew_position_uuid: string;
}

export const validMetaPositionUpdateProps: Array<string> = ["meta_name", "crew_position_uuid"];

export const baseMetaPositionData: string = "SELECT meta_position_uuid, meta_name, crew_position_uuid FROM meta_position";
