import * as UserService from "../../services/userService";
import User, { validUserUpdateProps } from "../../models/userInterface";

const airmanHandler = async (action: string, payload: { [key: string]: any }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "approve":
      console.log("Websocket Airman Approve case!");
      try {
        let airmenUUIDs = payload.users;
        console.log("Payload Users:", payload.users);

        let approved = await UserService.approveUsers(airmenUUIDs);

        let approved_users: any = [];
        for (const airman_uuid of airmenUUIDs) {
          let user = await UserService.getUser(airman_uuid);
          approved_users.push(user);
        }
        console.log("Approved Users List:", approved_users);
        callback(false, {airmen: approved_users});

      } catch (error) {
        console.error("Websocket Airman add error:", error);
        callback("Websocket Airman add error: " + error, null);
      }

      break;

    case "edit":
      console.log("Websocket Airman Edit case!");
      let updateProps: any = {};
      try {
        Object.keys(payload).forEach(element => {
          if (validUserUpdateProps.includes(element)) {
            updateProps[element] = payload[element]
          }
        });
        if (Object.keys(updateProps).length === 0) {
          console.log("Websocket Airman edit: no valid key found");
          callback("Websocket Airman edit: no valid key found", null);
          break;
        }
        let result = await UserService.updateUser(payload.account_uuid, updateProps);
        if (result.error) {
          console.log("Websocket Airman edit error:", result.error);
          callback(result.error, null);
          break;
        }
        callback(false, { ...updateProps, account_uuid: payload.account_uuid });
      } catch (error) {
        console.log("Websocket Airman edit error:", error);
        callback("Websocket Airman edit error: " + error, null);
      }
      break;

    default:
      callback("Websocket Airman: No valid action provided", null);
      break;
  }
}

export default airmanHandler;