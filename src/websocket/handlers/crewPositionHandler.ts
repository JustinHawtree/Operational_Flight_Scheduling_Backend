import CrewPosition, { validCrewPositionUpdateProps } from "../../models/crewPositionInterface";
import * as crewPositionService from "../../services/crewPositionService";

const crewPositionHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
    switch (action) {

        case "add":
            console.log("Websocket CrewPosition Add case!");
            try {
                let crew_position: CrewPosition = {
                    crew_position_uuid: "",
                    position: payload.position,
                    required: Boolean(payload.required)
                };

                let newCrewPosition = await crewPositionService.createCrewPosition(crew_position)
                callback(false, { ...crew_position, crew_position_uuid: newCrewPosition.newCrewPositionUUID });

            } catch (error) {
                console.error("Websocket CrewPosition add error:", error);
                callback("Websocket CrewPosition add error: " + error, null);
            }

            break;

        case "edit":
            console.log("Websocket CrewPosition Edit case!");
            let updateProps: any = {};
            try {
                Object.keys(payload).forEach(element => {
                    if (validCrewPositionUpdateProps.includes(element)) {
                        updateProps[element] = payload[element]
                    }
                });
                if (Object.keys(updateProps).length === 0) {
                    console.log("Websocket CrewPosition edit: no valid key found");
                    callback("Websocket CrewPosition edit: no valid key found", null);
                    break;
                }
                let result = await crewPositionService.updateCrewPosition(payload.crew_position_uuid, updateProps);
                if (result.error) {
                    console.log("Websocket CrewPosition edit error:", result.error);
                    callback(result.error, null);
                    break;
                }
                callback(false, { ...updateProps, crew_position_uuid: payload.crew_position_uuid });
            } catch (error) {
                console.log("Websocket CrewPosition edit error:", error);
                callback("Websocket CrewPosition edit error: " + error, null);
            }
            break;

        case "delete":
            console.log("this is deleting case!");
            try {
                if (payload.crew_position_uuid) {
                    let result = await crewPositionService.removeCrewPosition(payload.crew_position_uuid);
                    if (result.error) {
                        console.log("Websocket CrewPosition delete error:", result.error);
                        callback(result.error, { success: false });
                        break;
                    }
                    callback(false, { crew_position_uuid: payload.crew_position_uuid });
                    break;
                } else {
                    console.log("Websocket CrewPosition delete error: crew_position_uuid not provided");
                    callback("Websocket CrewPosition delete error: crew_position_uuid not provided", { success: false });
                }
            } catch (error) {
                console.log("Websocket CrewPosition delete error:", error);
                callback("Websocket CrewPosition delete error: " + error, null);
            }
            break;

        default:
            callback("Websocket CrewPosition: No valid action provided", null);
            break;
    }
}

export default crewPositionHandler;