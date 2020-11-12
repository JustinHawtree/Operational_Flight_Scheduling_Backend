/* test userService */

import * as userController from "../controllers/userController";
import * as userService from "../services/userService";
import User, { validUserUpdateProps, baseUserData } from "../models/userInterface";
import { expect } from "chai";

var testUser : User;