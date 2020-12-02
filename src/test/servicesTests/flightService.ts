/* test flightService */

import * as  flightController from "../../controllers/flightController";
import * as flightService from "../../services/flightService";
import Flight, { validFlightUpdateProps, baseFlightData, flightGroupBy } from "../../models/flightInterface";

import { expect } from 'chai';

var testFlight : Flight;
var testFlightUUID : any;

var testFlight2 : Flight;
var testFlight2UUID : any;

describe('#createFlight()', async function() {
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return an Object with the properties error and newFlightUUID', async function(){
        //Create a new Flight, store the Object returned by createFlight in res
        //flight_uuid, aircraft_uuid, location_uuid, start_time, end_time, color, title, description, allDay
        let newFlight : Flight = {flight_uuid: '90f9f461-cf01-4c18-8513-10c6588044e7', aircraft_uuid: '63c6821a-fb98-418b-9336-c60beb837708', location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04', start_time: '2020-12-24 22:27:38', end_time: '2020-12-25 02:27:38', color: '#eb8334', title: 'Mock Flight', description: 'Test Flight for backend testing', allDay: false};
        
        let res = await flightService.createFlight(newFlight);

        //We expect res to be an Object that has a property 'newFlightUUID', 
        expect(res).to.be.an('Object').with.property('error').that.equals(false);
        expect(res).to.have.property('newFlightUUID');

        testFlightUUID = res.newFlightUUID;

        //Use the UUID to see if the new flight was inserted into the database
        testFlight = await flightService.getFlight(testFlightUUID);
        expect(testFlight).to.be.an('Object').with.property('description').that.equals('Test Flight for backend testing');
    })

})


describe('#getFlight()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    it('should return a flight with description \'Test Flight for backend testing\'', async function(){
        expect(await flightService.getFlight(testFlight.flight_uuid)).to.be.an('Object').that.has.property('description').that.equals(testFlight.description);
    })

    it('should return a flight with description \'Mock Flight testing backend\'', async function(){
        expect(await flightService.getFlight('0bf6a55d-a5e7-4835-8d90-3a6bdd4f07d6')).to.be.an('Object').that.has.property('description').that.equals('Mock Flight testing backend');
    })

    //SQL Error
    it('should return an Error when attempting to get a flight that is not in the database', async function(){
        try {
            await flightService.getFlight('7a46e66f-b560-47b3-a5cb-e3c2fe00abfc');
        } catch (error) {
            expect(error.message).to.be.an('string').that.equals('Get Flight Error: ');
        }
    })
})

describe('#updateFlight()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms
    let updatedTitle : string = 'Test Flight';

    it('should return a Object with property error that is false (the Flgiht property title was successfully updated', async function () {      
        expect(await flightService.updateFlight(testFlight.flight_uuid, {title: updatedTitle})).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testFlight.title = updatedTitle;
    })

    it('should get the Flight and test that the title has been updated', async function(){
        expect(await flightService.getFlight(testFlight.flight_uuid)).to.be.an('Object').with.property('title').that.equals(updatedTitle);
    })

    it('should return \'Body didnt have any valid column names for Flight\' when attempting to update an invalid property', async function(){
        expect(await flightService.updateFlight(testFlight.flight_uuid, {invalid_prop: 'prop'})).to.be.an('Object').with.property('error').that.equals('Body didnt have any valid column names for Flight');
    })

    it('should return \'No row updated\' when attempting to update a flight that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';
        expect(await flightService.updateFlight(testingUUID, {title: 'Title'})).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})


describe('#replaceFlight()', async function () {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms
    
    it('should return an Object with property error that has value false', async function () {
        let replacementFlight : Flight = {flight_uuid: testFlightUUID, aircraft_uuid: '63c6821a-fb98-418b-9336-c60beb837708', location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04', start_time: '2020-12-31 22:27:38', end_time: '2020-12-31 02:27:38', color: '#eb8334', title: 'NY Flight', description: 'Test Flight on Dec 31', allDay: false}
        expect(await flightService.replaceFlight(testFlight.flight_uuid, replacementFlight)).to.be.an('Object').with.property('error').that.equals(false);
        
        //Update global variable
        testFlight = replacementFlight;
    })

    it('should return \'No row updated\' when attempting to replace a flight that is not in the database', async function(){
        let testingUUID = 'c03172fd-06cb-460f-b58c-733d531c5710';

        expect(await flightService.replaceFlight(testingUUID, testFlight)).to.be.an('Object').with.property('error').that.equals('No row updated');
    })
})

describe('#getAllFlights()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Create another flight
    it('should return an Object with the properties error and newFlightUUID', async function(){
        //Create a new Flight, store the Object returned by createFlight in res
        //flight_uuid, aircraft_uuid, location_uuid, start_time, end_time, color, title, description, allDay
        let newFlight : Flight = {flight_uuid: '90f9f461-cf01-4c18-8513-10c6588044e7', aircraft_uuid: '63c6821a-fb98-418b-9336-c60beb837708', location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04', start_time: '2020-12-24 12:27:38', end_time: '2020-12-25 16:27:38', color: '#eb8334', title: 'Mock Flight', description: 'Test Flight for backend testing', allDay: false};
        
        let res = await flightService.createFlight(newFlight);

        //We expect res to be an Object that has a property 'newFlightUUID', 
        expect(res).to.be.an('Object').with.property('error').that.equals(false);
        expect(res).to.have.property('newFlightUUID');

        testFlight2UUID = res.newFlightUUID;

        //Use the UUID to see if the new flight was inserted into the database
        testFlight2 = await flightService.getFlight(testFlight2UUID);
        expect(testFlight2).to.be.an('Object').with.property('description').that.equals('Test Flight for backend testing');
    })

    //Call getAllFlights to see if the function retrieves both flights created during testing
    it('should return an array of Flight that includes both test aircrafts', async function(){
        let res : any = await flightService.getAllFlights();
        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].flight_uuid == testFlight.flight_uuid)
                contains1 = true;
            else if(res[i].flight_uuid == testFlight2.flight_uuid)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })
})

describe('#getAllFlightsBetweenTimes()', async function(){
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Call getAllFlightsBetweenTimes to see if the function retrieves both flights created during testing (both in Dec)
    it('should return an array of Flight that includes both test flights', async function(){
        let startDate : Date = new Date('2020-12-01 00:00:00');
        let endDate : Date = new Date('2021-01-01 00:00:00');
        let res : any = await flightService.getAllFlightsBetweenTimes(startDate, endDate);
        let contains1 : boolean = false;
        let contains2 : boolean = false;
        let i : any = 0;

        while((contains1 == false || contains2 == false) && i < res.length)
        {
            if(res[i].flight_uuid == testFlight.flight_uuid)
                contains1 = true;
            else if(res[i].flight_uuid == testFlight2.flight_uuid)
                contains2 = true;

            i++;
        }

        expect((contains1 && contains2)).to.equal(true);
    })

    //Call getAllFlightsBetweenTimes for time frame we know will contain no flights
    it('should return an empty array (no flights between these dates)', async function(){
        let startDate : Date = new Date('2000-12-01 00:00:00');
        let endDate : Date = new Date('2000-01-01 00:00:00');
        let res : any = await flightService.getAllFlightsBetweenTimes(startDate, endDate);
     
        expect(res).to.be.an('array').that.is.empty;
    })

})

describe('#removeFlight()', async function(){
    this.slow(1000); // This test is slow if it takes longer than 1000 ms

    //Test if flight is removed without error
    it('should remove the test flight from the flight table', async function() {
        expect(await flightService.removeFlight(testFlight.flight_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    it('should remove the second test flight from the flight table', async function() {
        expect(await flightService.removeFlight(testFlight2.flight_uuid)).to.be.a('Object').that.has.property('error').that.equals(false);
    })

    //Attempt to get the removed flight
    it('should return an error when attempting to get a flight that is not in the flight table', async function(){
        try {
            await flightService.removeFlight(testFlight.flight_uuid);
        } catch (error) {
            expect(error.message).to.be.a('string');
        }
    })

    //Attempt to remove the test flight again, should return error: No row deleted because it has already been removed
    it('should return \'No row deleted\' because the test flight has already been deleted', async function() {
        expect(await flightService.removeFlight(testFlight.flight_uuid)).to.be.a('Object').that.has.property('error').that.equals('No row deleted');
    })   

})
