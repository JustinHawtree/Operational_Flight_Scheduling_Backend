/*
import * as AircraftService from "../../services/aircraftService";
import * as AircraftController from "../../controllers/aircraftController";
import Aircraft, { validAircraftUpdateProps, baseAircraftData } from "../../models/aircraftInterface";
import * as app from "../../index";

import { expect } from "chai";

import chai from 'chai';
import chaiHTTP from 'chai-http';

chai.use(chaiHTTP);

var host = "http://localhost:3000/";

//admin login credentials
const adminCredentials = {
    email: 'admin@home.com', 
    password: 'root'
}
    //Login as an admin
    var admin = chai.request.agent(app);
    before(function(done){
        admin.post('/login')
        .send(adminCredentials)
        .end(function(err, res){
            expect(res.status).to.equal(200);
            done();
        });
    });

describe("#getOneByUUID()", function() {
    it("should return status 401", async function() {
        let uuid = '63c6821a-fb98-418b-9336-c60beb837708'
        admin.get(host+'api/aircraft/'+uuid)
        .send({ aircraft_uuid : uuid })
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.status).to.equal(401);
        });
    });
});

*/