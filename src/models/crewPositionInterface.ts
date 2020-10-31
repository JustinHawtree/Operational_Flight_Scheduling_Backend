export default interface CrewPosition {
  crew_position_uuid: string;
  position: string;
  required: boolean;
}

export const validCrewPositionUpdateProps: Array<string> = ["position", "required"];

export const baseCrewPositionData: string = "SELECT crew_position_uuid, position, required FROM crew_position ";
