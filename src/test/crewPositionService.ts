/* test crewPositionService */

import * as  crewPositionController from "../controllers/crewPositionController";
import * as crewPositionService from "../services/crewPositionService";
import CrewPosition, { baseCrewPositionData, validCrewPositionUpdateProps } from "../models/crewPositionInterface";

import { expect } from 'chai';

var testPosition : CrewPosition;

describe('#createCrewPosition()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    it('should insert Test Position into the crew_position table', async function() {     
        let newPositionName : string = 'Test Position';

        testPosition = {crew_position_uuid: '', position: newPositionName, required: false};
        let res = await crewPositionService.createCrewPosition(testPosition);
        testPosition.crew_position_uuid = res.newCrewPositionUUID;

        expect(res).to.be.an('Object').that.has.property('newCrewPositionUUID').that.is.a('string');
        expect(await crewPositionService.getCrewPosition(res.newCrewPositionUUID)).to.be.an('Object').that.has.property('position').that.equals(newPositionName);

    })
})

describe('#getCrewPosition()', async function() {
    this.slow(1000); //This ttest is slow if it takes longer than 1000 ms

    //should return the Test Position
    it('should return an Object with position Test Position', async function(){
        expect(await crewPositionService.getCrewPosition(testPosition.crew_position_uuid)).to.be.an('Object').that.has.property('position').that.equals(testPosition.position);
    })
})

describe('#removeCrewPosition()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should remove Test Position from the crew_position table', async function() {
        //Check if Test Position was deleted without error
        expect(await crewPositionService.removeCrewPosition( testPosition.crew_position_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })  

    it('should return \'No row deleted\' because Test Position has already been deleted', async function() {
        //Attempt to remove the same crew position again, should return the error: No row deleted
        expect(await crewPositionService.removeCrewPosition( testPosition.crew_position_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })    
})
