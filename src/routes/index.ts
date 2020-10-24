import { Router } from "express";
import auth from "./authRoute";
import user from "./userRoute";
import aircraft from "./aircraftRoute";


const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/aircraft", aircraft);

export default routes;