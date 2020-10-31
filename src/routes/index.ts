import { Router } from "express";
import auth from "./authRoute";
import user from "./userRoute";
import aircraft from "./aircraftRoute";
import location from "./locationRoute";
import aircraft_model from "./aircraftModelRoute";


const routes = Router();
// TODO: might want to make it auth or keep it just /
routes.use("/", auth);
routes.use("/user", user);
routes.use("/aircraft", aircraft);
routes.use("/location", location);
routes.use('/aircraft_model', aircraft_model);

export default routes;