/* test aircraftService */

import * as AircraftController from "../../controllers/aircraftController";
import * as AircraftService from "../../services/aircraftService";
import Aircraft, { validAircraftUpdateProps, baseAircraftData } from "../../models/aircraftInterface";

import * as AircraftModelController from "../../controllers/aircraftModelController";
import * as AircraftModelService from "../../services/aircraftModelService";
import AircraftModel, { validAircraftModelUpdateProps, baseAircraftModelData, aircraftModelGroupBy } from "../../models/aircraftModelInterface";

import { expect } from 'chai';
import { replaceCrewPosition } from "../../services/crewPositionService";

var testAircraft : Aircraft;
var testAircraft2 : Aircraft;
var testModel : AircraftModel;

describe('#createAircraft()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    
    //Create new Aircraft and test to see if it is in the database
    it('should insert Test Aircraft into the aircraft table', async function() {
        //Create a model to use for creating a test aircraft
        let newModelName: string = "Test Aircraft";

        //Create a new model, store the Object returned by createAircraftModel in resModel
        testModel = {model_uuid: '', model_name: newModelName};
        let resModel : any = await AircraftModelService.createAircraftModel(testModel); 
        testModel.model_uuid = resModel.newAircraftModelUUID;

        //Create new aircraft, store the Ojbect returned by createAircraft in resAircraft
        testAircraft = {aircraft_uuid: '', model_uuid: testModel.model_uuid, tail_code: 'MY89114', status: 'Available'};
        let resAircraft : any = await AircraftService.createAircraft(testAircraft);
        testAircraft.aircraft_uuid = resAircraft.newAircraftUUID;

        //Use the UUID to see if the new aircraft was inserted into the database
        expect(await AircraftService.getAircraft(testAircraft.aircraft_uuid)).to.be.an('Object').with.property('model_uuid').that.equals(testModel.model_uuid);
    })
})

describe('#getAircraft()', async function () {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    it('should return an Object that is the Test Aircraft', async function () {
        expect(await AircraftService.getAircraft(testAircraft.aircraft_uuid)).to.be.an('Object').that.has.property('model_uuid').that.equals(testModel.model_uuid);
    })

    it('should return an Object that is an aircraft that has been previously added to the database', async function(){
        expect(await AircraftService.getAircraft('5a3db7a6-ffea-427d-8093-4c2d26392fb8')).to.be.an('Object').with.property('model_uuid').that.equals('db2863ea-369e-4262-ad17-bda986ae9632');
    })

    //SQL Error
    it('should return an Error when attempting to get a aircraft that is not in the database', async function(){
        try {
            await AircraftService.getAircraft('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Aircraft Error: ');
        }
    })
})

describe('#updateAircraft()', async function () {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    
    //Test to see if status is updated
    it('should return a Object with property error that is false (the Aircraft property status was successfully updated', async function () {
        expect(await AircraftService.updateAircraft(testAircraft.aircraft_uuid, {status: 'Unavailable'})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testAircraft.status = 'Unavailable';
    })

    it('should get the Aircraft and test that the status has been updated', async function(){
        expect(await AircraftService.getAircraft(testAircraft.aircraft_uuid)).to.be.an('Object').with.property('status').that.equals('Unavailable');
    })

    it('should return \'Body didnt have any valid column names for Aircraft\' when attempting to update an invalid property', async function(){
        expect(await AircraftService.updateAircraft(testAircraft.aircraft_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Aircraft');
    })

    it('should return \'No row updated\' when attempting to update an aircraft that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await AircraftService.updateAircraft(testingUUID, {status: 'Available'})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})


describe('#replaceAircraft()', async function () {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    
    it('should return an Object with property error that has value false', async function () {
        let replacementAircraft : Aircraft = {aircraft_uuid: testAircraft.aircraft_uuid, model_uuid: testModel.model_uuid, tail_code: 'MY89113', status: 'Unavailable'};
        expect(await AircraftService.replaceAircraft(testAircraft.aircraft_uuid, replacementAircraft)).to.be.an('Object').with.property('error').that.equals(false);
    
        //Update global variable
        testAircraft = replacementAircraft;
    })

    it('should return \'No row updated\' when attempting to update an aircraft that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        let replacementAircraft : Aircraft = {aircraft_uuid: testingUUID, model_uuid: testModel.model_uuid, tail_code: 'MY89113', status: 'Unavailable'};
        expect(await AircraftService.replaceAircraft(testingUUID, replacementAircraft)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#getAllAircrafts()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Create another aircraft
    it('should insert Test Aircraft into the aircraft table', async function() {
        //Create a model to use for creating a test aircraft
        let newModelName: string = "Test Aircraft II";

        //Create new aircraft, store the Ojbect returned by createAircraft in resAircraft
        testAircraft2 = {aircraft_uuid: '', model_uuid: testModel.model_uuid, tail_code: 'MY89114', status: 'Available'};
        let resAircraft : any = await AircraftService.createAircraft(testAircraft2);
        testAircraft2.aircraft_uuid = resAircraft.newAircraftUUID;

        //Use the UUID to see if the new aircraft was inserted into the database
        expect(await AircraftService.getAircraft(testAircraft2.aircraft_uuid)).to.be.an('Object').with.property('model_uuid').that.equals(testModel.model_uuid);
    })

    //Call getAllAircrafts to see if the function retrieves both aircrafts created during testing
    it('should return an array of Aircraft that includes both test aircrafts', async function(){
        let res : any = await AircraftService.getAllAircrafts();
        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].aircraft_uuid == testAircraft.aircraft_uuid)
                contains1 = true;
            else if(res[i].aircraft_uuid == testAircraft2.aircraft_uuid)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})


describe('#removeAircraft()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test to see if Test Aircraft is removed without error
    it('should remove Test Aircraft from the aircraft table', async function() {
        expect(await AircraftService.removeAircraft(testAircraft.aircraft_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    it('should remove Test Aircraft II from the aircraft table', async function() {
        expect(await AircraftService.removeAircraft(testAircraft2.aircraft_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    //Attempt to get the removed aircraft
    it('should return an error when attempting to get a model that is not in the aircraft_model table', async function(){
        try {
            await AircraftService.getAircraft(testAircraft.aircraft_uuid);
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Aircraft Error : ');
        }
    })

    //Attempt to removed the Test Aircraft again, this should return the error: No row deleted because it has already been deleted
    it('should return \'No row deleted\' because Test Aircraft has already been deleted', async function() {
        expect(await AircraftModelService.removeAircraftModel(testAircraft.aircraft_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })
    
    //Remove model used for testing, test if this is done seccessfully
    it('should remove Test Model from the aircraft_model table', async function() {
        expect(await AircraftModelService.removeAircraftModel(testModel.model_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

})
