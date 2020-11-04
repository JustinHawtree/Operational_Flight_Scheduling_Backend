import { Router } from "express";
import auth from "./authRoute";
import user from "./userRoute";
import aircraft from "./aircraftRoute";
import location from "./locationRoute";
import aircraft_model from "./aircraftModelRoute";
import crew_position from "./crewPositionRoute";
import flight from "./flightRoute";
import essential from "./essentialRoute";


const routes = Router();
// TODO: might want to make it auth or keep it just /
routes.use("/", auth);
routes.use("/user", user);
routes.use("/aircraft", aircraft);
routes.use("/location", location);
routes.use('/aircraft_model', aircraft_model);
routes.use("/crew_position", crew_position);
routes.use("/flight", flight);
routes.use("/essential", essential);

export default routes;