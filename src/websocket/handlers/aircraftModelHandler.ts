import AircraftModel, { validAircraftModelUpdateProps } from "../../models/aircraftModelInterface";
import * as aircraftModelService from "../../services/aircraftModelService";
import * as modelPositionService from "../../services/modelPositionService";

const aircraftModelHandler = async (action: string, payload: { [key: string]: any }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "add":
      console.log("Websocket AircraftModel Add case!");
      try {
        let aircraft_model: AircraftModel = {
          model_uuid: "",
          model_name: payload.model_name,
        };

        let newAircraftModel = await aircraftModelService.createAircraftModel(aircraft_model);

        if (payload.positions && payload.positions.length) {
          let positionNum = 1;
          for (const crew_position of payload.positions) {
            let modelPositionResult = await modelPositionService.createModelPosition(
              { model_position_uuid: "", 
                model_uuid: newAircraftModel.newAircraftModelUUID,
                crew_position_uuid: crew_position.crew_position_uuid,
                position_order: positionNum
              });
          }
        }

        callback(false, { ...aircraft_model, model_uuid: newAircraftModel.newAircraftModelUUID, positions: payload.positions ? payload.positions : [] });

      } catch (error) {
        console.error("Websocket AircraftModel add error:", error);
        callback("Websocket AircraftModel add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket AircraftModel Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validAircraftModelUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket AircraftModel edit: no valid key found");
          callback("Websocket AircraftModel edit: no valid key found", null);
          break;
        }
        let result = await aircraftModelService.updateAircraftModel(payload.model_uuid, updateProps);
        if (result.error) {
          console.log("Websocket AircraftModel edit error:", result.error);
          callback(result.error, null);
          break;
        }
        callback(false, { ...updateProps, model_uuid: payload.model_uuid });
      } catch (error) {
        console.log("Websocket AircraftModel edit error:", error);
        callback("Websocket AircraftModel edit error: " + error, null);
      }
      break;

    case "delete":
      console.log("this is deleting case!");
      try {
        if (payload.model_uuid) {
          let result = await aircraftModelService.removeAircraftModel(payload.model_uuid);
          if (result.error) {
            console.log("Websocket AircraftModel delete error:", result.error);
            callback(result.error, { success: false });
            break;
          }
          callback(false, { model_uuid: payload.model_uuid });
          break;
        } else {
          console.log("Websocket AircraftModel delete error: model_uuid not provided");
          callback("Websocket AircraftModel delete error: model_uuid not provided", { success: false });
        }
      } catch (error) {
        console.log("Websocket AircraftModel delete error:", error);
        callback("Websocket AircraftModel delete error: " + error, null);
      }
      break;

    default:
      callback("Websocket AircraftModel: No valid action provided", null);
      break;
  }
}

export default aircraftModelHandler;