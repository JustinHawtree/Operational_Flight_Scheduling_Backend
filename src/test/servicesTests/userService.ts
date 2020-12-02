/* test userService */

import * as userController from "../../controllers/userController";
import * as userService from "../../services/userService";
import * as authService from "../../services/authService";
import User, { validUserUpdateProps, baseUserData } from "../../models/userInterface";
import { expect } from "chai";

var testUser : User;

describe('#getUser()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //We will user the hard-coded User "John Doe" to test
    let userUUID = '8880549d-40c6-4efe-a9dc-f3f276fb8837';

    //Get the user
    it('should get the account of John Doe (by UUID) from the account table', async function(){
        let res : User = await userService.getUser(userUUID);

        expect(res).to.be.an('Object');

        //Check that first and last name match
        expect(res.first_name).to.equal('John');
        expect(res.last_name).to.equal('Doe');

        //Store in testUser for testing use
        testUser = await userService.getUser(userUUID);
    })

    //SQL Error
    it('should return an error when attempting to get a user that is not in the account table', async function(){
        try {
            await userService.getUser('8880549d-40c6-4efe-a9dc-f3f276fb8839');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get User Error: ');
        }
    })
})

describe('#getAllUsers()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should return an array of User with all the accounts in the database', async function(){
        let res : any = await userService.getAllUsers();

        let user1UUID : any = '8880549d-40c6-4efe-a9dc-f3f276fb8837'; //John Doe
        let user2UUID : any = 'd205a550-f6e5-47ce-a9e1-f2fc0e2cb113'; //Jane Doe

        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].account_uuid == user1UUID)
                contains1 = true;
            else if(res[i].account_uuid == user2UUID)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})


//Run after the authService tests
describe('#getNonApprovedUsers()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should return an array of User where the accounts have not been approved', async function(){
        let res : any = await userService.getNonApprovedUsers();

        expect(res.length).to.equal(1);
    })
})


describe('#getPilots()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should return an array of User that includes all the pilots in the database', async function(){
        let res : any = await userService.getPilots();

        let user1UUID : any = '8880549d-40c6-4efe-a9dc-f3f276fb8837'; //John Doe is a pilot (FP)
        let user2UUID : any = 'd205a550-f6e5-47ce-a9e1-f2fc0e2cb113'; //Jane Doe is a pilot (FP)

        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].account_uuid == user1UUID)
                contains1 = true;
            else if(res[i].account_uuid == user2UUID)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})

describe('#updateUser()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms
    let updatedFirstName = 'Test';

    //Test to see if first_name is updated
    it('should return an Object with property error that equals false (no errors were encountered when updating the \'first_name\' property)', async function(){
        expect(await userService.updateUser(testUser.account_uuid, {first_name: updatedFirstName, accepted: false})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variables
        testUser.first_name = updatedFirstName;
        testUser.accepted = false;
    })
    
    it('should get the user and test that first_name and accepted have been updated', async function(){
        let res = await userService.getUser(testUser.account_uuid);
        expect(res).to.be.an('Object').with.property('first_name').that.equals(updatedFirstName);
        expect(res).to.have.property('accepted').that.equals(false);
    })

    it('should return \'Body didnt have any valid column...\' because we are passing in an invalid property for user/account', async function() {
        expect(await userService.updateUser(testUser.account_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for User');
    })

    it('should return \'No row updated\' when attempting to update a user/account that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await userService.updateUser(testingUUID, {first_name: 'Name'})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})


describe('#replaceUser()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms
    let originalName = 'John';

    //Replace with original user
    it('should return an Object with property \'error\' that equals false (no errors were encountered when replacing the updated user with a User that matches the original)', async function() {
        let replacementUser : User = await userService.getUser('8880549d-40c6-4efe-a9dc-f3f276fb8837');
        replacementUser.first_name = originalName;

        expect(await userService.replaceUser(testUser.account_uuid, replacementUser)).to.be.an('Object').with.property('error').that.equals(false);
        
        //Updated global variable
        testUser.first_name = originalName;
    })
    

    it('should return an Object with property \'error\' that equals \'No row updated\' (attempting to replace a User that is not in the database)', async function(){
        let testingUUID = '55798476-721c-4aa0-9c4e-72225848d9f2';
        expect(await userService.replaceUser(testingUUID, testUser)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})


describe('#approveUsers()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should approve the testUser we have been using, set accepted to true', async function(){
        expect(await userService.approveUsers([testUser.account_uuid])).to.be.an('Object').with.property('error').that.equals(false);
        expect(await userService.getUser(testUser.account_uuid)).to.be.an('Object').with.property('accepted').that.equals(true);
    })

    it('should return \'No valid acount uuid\'s were given to approveUsers function\'', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await userService.approveUsers([])).to.be.an('Object').with.property('error').that.equals("No valid acount uuid's were given to approveUsers function");
    })

})
