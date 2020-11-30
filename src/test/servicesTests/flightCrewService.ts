/* test flightCrewService */

import FlightCrew, { validFlightCrewUpdateProps, baseFlightCrewData } from "../../models/flightCrewInterface";
import Flight, { validFlightUpdateProps, baseFlightData, flightGroupBy } from "../../models/flightInterface";
import User, { validUserUpdateProps, baseUserData } from "../../models/userInterface";
import CrewPosition from "../../models/crewPositionInterface";

import * as flightCrewService from "../../services/flightCrewService";
import * as flightService from "../../services/flightService";
import * as userService from "../../services/userService"
import * as crewPositionService from "../../services/crewPositionService"

import { expect } from 'chai';


var testFlightCrew : FlightCrew;

//Maintain UUIDs
var testFlightCrewUUID : any;
var testAccountUUID = 'd205a550-f6e5-47ce-a9e1-f2fc0e2cb113'; // Jane Doe
var testFlightUUID = 'e74aa81e-e861-4329-823c-0c646c3f3a38'; // HH-60 Pave Hawk flight
var pilotUUID = 'b15bd146-0d92-4080-9740-2112fed365fd'; //Pilot
var copilotUUID = '991dd169-dc45-4049-8a8d-58173d66223b'; //Copilot

//createFlightCrewsByFlight, removeFlightCrewsByFlight
var byFlightFlightUUID : any; 

describe('#createFlightCrew()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return Object with properties error [that equals false] and newFlightCrewUUID', async function(){

        //We will be adding "Jane Doe" as a "Copilot" for the flight (testFlightUUID)
        testFlightCrew = {flight_crew_uuid: '', flight_uuid: testFlightUUID, account_uuid: testAccountUUID, crew_position_uuid: copilotUUID};        

        let res = await flightCrewService.createFlightCrew(testFlightCrew);

        //We expect res to be an Object that has a property 'newFlightCrewUUID', 
        
        expect(res).to.be.an('Object').with.property('error').that.equals(false);
        expect(res).to.have.property('newFlightCrewUUID');

        testFlightCrewUUID = res.newFlightCrewUUID;
        testFlightCrew.flight_crew_uuid = testFlightCrewUUID;

        //Use the UUID to see if the new model was inserted into the database
        expect(await flightCrewService.getFlightCrew(testFlightCrewUUID)).to.be.an('Object').that.has.property('flight_uuid').that.equals(testFlightUUID);
     
    })

})

describe('#getFlightCrew()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with account_uuid that is testAccountUUID', async function(){
        expect(await flightCrewService.getFlightCrew(testFlightCrewUUID)).to.be.an('Object').with.property('account_uuid').that.equals(testAccountUUID);
    })

    //SQL Error
    it('should return an Error when attempting to get a FlightCrew that is not in the database', async function(){
        try {
            await flightCrewService.getFlightCrew('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get FlightCrew Error: ');
        }
    }) 
})

describe('#updateFlightCrew()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test to see if crew_position_uuid is updated
    it('should return an Object with property error that equals false (no errors were encountered when updating the \'crew_position_uuid\' property', async function(){
        expect(await flightCrewService.updateFlightCrew(testFlightCrewUUID, {crew_position_uuid: pilotUUID})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testFlightCrew.crew_position_uuid = pilotUUID;
    })
    
    it('should get the FlightCrew and test that the crew_position_uuid has been updated', async function(){
        expect(await flightCrewService.getFlightCrew(testFlightCrewUUID)).to.be.an('Object').with.property('crew_position_uuid').that.equals(pilotUUID);
    })

    it('should return \'Body didnt have any valid column...\' because we are passing in an invalid property for FlightCrew', async function() {
        expect(await flightCrewService.updateFlightCrew(testFlightCrewUUID, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Flight Crew');
    })

    it('should return \'No row updated\' when attempting to update a FlightCrew that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await flightCrewService.updateFlightCrew(testingUUID, {crew_position_uuid: pilotUUID})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })

})

describe('#replaceFlightCrew()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with property \'error\' that equals false (no errors were encountered when replacing Test Model with Replacement Model', async function() {

        let replacementFlightCrew : FlightCrew = {flight_crew_uuid: testFlightCrewUUID, flight_uuid: testFlightUUID, account_uuid: testAccountUUID, crew_position_uuid: copilotUUID}; 
    
        expect(await flightCrewService.replaceFlightCrew(testFlightCrewUUID, replacementFlightCrew)).to.be.an('Object').with.property('error').that.equals(false);
        
        //Updated global variable
        testFlightCrew = replacementFlightCrew;
    })
    

    it('should return an Object with property \'error\' that equals \'No row updated\' (attempting to replace an FlightCrew that is not in the database)', async function(){
        let testingUUID = '55798476-721c-4aa0-9c4e-72225848d9f2';
        expect(await flightCrewService.replaceFlightCrew(testingUUID, testFlightCrew)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })

})

describe('#removeFlightCrew()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test if model is removed without error
    it('should remove Replacement Model from the aircraft_model table', async function() {
        expect(await flightCrewService.removeFlightCrew(testFlightCrewUUID)).to.be.an('Object').that.has.property('error').that.equals(false);
    })  

    //Attempt to get the removed model
    it('should return an Error when attempting to get a FlightCrew that is not in the flight_crew table', async function(){
        try {
            await flightCrewService.getFlightCrew(testFlightCrewUUID);
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get FlightCrew Error : ');
        }
    })

    //Attempt to removed the flight crew again, this should return the error: No row deleted because it has already been deleted
    it('should return \'No row deleted\' because the test FlightCrew has already been deleted', async function() {
        expect(await flightCrewService.removeFlightCrew(testFlightCrewUUID)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })
})

type CrewMembers = { airman_uuid: string, crew_position_uuid: string };

describe('#createFlightCrewsByFlight()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms    

    //createFlightCrewsByFlight()
    it('should return an Object with property error that equals false or', async function(){

        let newFlight : Flight;
        let firstCrewMember : CrewMembers = {airman_uuid: 'd205a550-f6e5-47ce-a9e1-f2fc0e2cb113', crew_position_uuid: pilotUUID};
        let secondCrewMember : CrewMembers = {airman_uuid: '8880549d-40c6-4efe-a9dc-f3f276fb8837', crew_position_uuid: copilotUUID};

        //Create flight for testing createFlightCrewsByFlight, removeAllFlightCrewsByFlight
        newFlight = {flight_uuid: '90f9f461-cf01-4c18-8513-10c6588044e7', aircraft_uuid: '63c6821a-fb98-418b-9336-c60beb837708', location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04', start_time: '2020-12-24 22:27:38', end_time: '2020-12-25 02:27:38', color: '#eb8334', title: 'Mock Flight', description: 'Test Flight for creating and removing flight crews by flight', allDay: false};
        let res = await flightService.createFlight(newFlight);
        newFlight.flight_uuid = res.newFlightUUID;
        byFlightFlightUUID = newFlight.flight_uuid;

        expect(await flightCrewService.createFlightCrewsByFlight(newFlight.flight_uuid, [firstCrewMember, secondCrewMember])).to.be.an('Object').with.property('error').that.equals(false);
    })

    it('should return an Object with property error that equals \'Create Flight Crews By Flight was given a null or empty crew_members argument\'', async function(){
        expect(await flightCrewService.createFlightCrewsByFlight(byFlightFlightUUID, [])).to.be.an('Object').with.property('error').that.equals('Create Flight Crews By Flight was given a null or empty crew_members argument');
    })
})

describe('#removeAllFlightCrewsByFlight()', async function(){
    
    //Test if flight is removed without error
    it('should remove the test flight from the flight table', async function() {
        expect(await flightCrewService.removeAllFlightCrewsByFlight(byFlightFlightUUID)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    //Attempt to remove the test flight again, should return error: No row deleted because it has already been removed
    it('should return \'No row deleted\' because the flight crew entries have already been deleted', async function() {
        expect(await flightCrewService.removeAllFlightCrewsByFlight(byFlightFlightUUID)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })

    it('should remove the flight for testing createFlightCrewsByFlight and removeAllFlightCrewsByFlight', async function(){
        expect(await flightService.removeFlight(byFlightFlightUUID)).to.be.an('Object').with.property('error').that.equals(false);
    })
})
