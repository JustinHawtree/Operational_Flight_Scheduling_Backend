/* test crewPositionService */

import * as  crewPositionController from "../../controllers/crewPositionController";
import * as crewPositionService from "../../services/crewPositionService";
import CrewPosition, { baseCrewPositionData, validCrewPositionUpdateProps } from "../../models/crewPositionInterface";

import { expect } from 'chai';

var testPosition : CrewPosition;
var testPosition2 : CrewPosition;

describe('#createCrewPosition()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    //Create new CrewPosition and test to see if it is in the database
    it('should insert Test Position into the crew_position table', async function() {     
        let newPositionName : string = 'Test Position';

        //Create a new CrewPosition, store the Object returned by createCrewPosition in res
        testPosition = {crew_position_uuid: '', position: newPositionName, required: false};
        let res = await crewPositionService.createCrewPosition(testPosition);
        testPosition.crew_position_uuid = res.newCrewPositionUUID;

        //We expect res to be an Object that has a property 'newCrewPositionUUID', 
        //Use the UUID to see if the new position was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newCrewPositionUUID').that.is.a('string');
        expect(await crewPositionService.getCrewPosition(res.newCrewPositionUUID)).to.be.an('Object').that.has.property('position').that.equals(newPositionName);
    })
})

describe('#getCrewPosition()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should return an Object with position Test Position', async function(){
        expect(await crewPositionService.getCrewPosition(testPosition.crew_position_uuid)).to.be.an('Object').that.has.property('position').that.equals(testPosition.position);
    })

    it('should return an Object that is the \'Pilot\' CrewPostion', async function(){
        expect(await crewPositionService.getCrewPosition('b15bd146-0d92-4080-9740-2112fed365fd')).to.be.an('Object').with.property('position').that.equals('Pilot');
    })

    //SQL Error
    it('should return an Error when attempting to get a position that is not in the database', async function(){
        try {
            await crewPositionService.getCrewPosition('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get CrewPosition Error: ');
        }
    })
})
 
describe('#updateCrewPosition()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Test to see if required is updated
    it('should return an Object with property error that has value false (the CrewPosition property \'required\' was successfully updated)', async function(){
        expect(await crewPositionService.updateCrewPosition(testPosition.crew_position_uuid, {required: true})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testPosition.required = true;
    })

    it('should return an Object with property error that has value \'Body didnt have any valid column names for Crew Position\' when attempting update an invalid property', async function(){
        expect(await crewPositionService.updateCrewPosition(testPosition.crew_position_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Crew Position');
    })

    it('should return \'No row updated\' when attempting to update an aircraft that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await crewPositionService.updateCrewPosition(testingUUID, {required: true})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#replaceCrewPosition()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    let replacementPositionName = 'Replacement Position';

    it('should return an Object with property error that has value false', async function () {
        let replacementCrewPosition : CrewPosition = {crew_position_uuid: testPosition.crew_position_uuid, position: replacementPositionName, required: false};
        expect(await crewPositionService.replaceCrewPosition(testPosition.crew_position_uuid, replacementCrewPosition)).to.be.an('Object').with.property('error').that.equals(false);
    
        //Update global variable
        testPosition = replacementCrewPosition;
    })

    it('should return \'No row updated\' when attempting to update an CrewPosition that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        let replacementCrewPosition : CrewPosition = {crew_position_uuid: testingUUID, position: replacementPositionName, required: false};
        expect(await crewPositionService.replaceCrewPosition(testingUUID, replacementCrewPosition)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#getAllCrewPositions()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Create another Crewpostion
    it('should insert Test Position II into the crew_position table', async function() {     
        let newPositionName : string = 'Test Position II';

        //Create a new CrewPosition, store the Object returned by createCrewPosition in res
        testPosition2 = {crew_position_uuid: '', position: newPositionName, required: false};
        let res = await crewPositionService.createCrewPosition(testPosition2);
        testPosition2.crew_position_uuid = res.newCrewPositionUUID;

        //We expect res to be an Object that has a property 'newCrewPositionUUID', 
        //Use the UUID to see if the new position was inserted into the database
        expect(res).to.be.an('Object').that.has.property('newCrewPositionUUID').that.is.a('string');
        expect(await crewPositionService.getCrewPosition(res.newCrewPositionUUID)).to.be.an('Object').that.has.property('position').that.equals(newPositionName);
    })

    //Call getAllCrewPositions to see if the function retrieves both positions created during testing
    it('should return an array of CrewPosition the includes both test positions', async function(){
        let res : any = await crewPositionService.getAllCrewPositions();
        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].crew_position_uuid == testPosition.crew_position_uuid)
                contains1 = true;
            else if(res[i].crew_position_uuid == testPosition2.crew_position_uuid)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})

describe('#removeCrewPosition()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms
 
    //Check if Test Position was deleted without error
    it('should remove Test Position from the crew_position table', async function() {
        expect(await crewPositionService.removeCrewPosition( testPosition.crew_position_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    it('should remove Test Position II from the crew_position table', async function() {
        expect(await crewPositionService.removeCrewPosition( testPosition2.crew_position_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    //Attempt to get the removed position
    it('should return an error when attempting to get a model that is not in the aircraft_model table', async function(){
        try {
            await crewPositionService.getCrewPosition(testPosition.crew_position_uuid);
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get CrewPosition Error : ');
        }
    })

    //Attempt to remove the same crew position again, should return the error: No row deleted
    it('should return \'No row deleted\' because Test Position has already been deleted', async function() {
        
        expect(await crewPositionService.removeCrewPosition( testPosition.crew_position_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })    
})
