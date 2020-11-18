/* test userService */

import * as userController from "../controllers/userController";
import * as userService from "../services/userService";
import * as authService from "../services/authService";
import User, { validUserUpdateProps, baseUserData } from "../models/userInterface";
import { expect } from "chai";

var testUser : User;

describe('#getUser()', async function() {
    //Get the user
    it('should get the account of John Doe from the account table', async function(){
        let res : User = await userService.getUser('8880549d-40c6-4efe-a9dc-f3f276fb8837');
        expect(res).to.be.an('Object');

        //Check that first and last name match
        expect(res.first_name).to.equal('John');
        expect(res.last_name).to.equal('Doe');
    })

    it('should return an error when attempting to get a user that is not in the account table', async function(){
        //Get the user
        try {
            await userService.getUser('8880549d-40c6-4efe-a9dc-f3f276fb8839');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get User Error: ');
        }
    })
})