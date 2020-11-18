/* test authService */

//Add tests for Bcrypt error and SQL error

import * as authController from "../controllers/authController";
import * as authService from "../services/authService";

import { expect } from 'chai';

describe('#signUpUser()', async function() {
    this.slow(1000); //This test is slow if it takes longer than 1000 ms

    //Should return no error when adding a new user
    it('should return an Object with property \'error\' that has the value false', async function(){
        expect(await authService.signUpUser('test@home.com', 'test', 'Test', 'User')).to.be.an('Object').that.has.property('error').that.equals(false);   
    })

    //Should return 'Email already in use' message when attempting to add the same user again
    it('should return \'Email already in use\' message when attempting to add the same user again', async function(){
        expect(await authService.signUpUser('test@home.com', 'test', 'Test', 'User')).to.be.an('Object').that.has.property('error').that.equals('Email is already in use.');
    })
    
})

describe('#loginUser()', async function() {
    this.slow(1000) // This test is slow if it takes longer than 1000 ms

    //Should return an Object that contains the user's information (appproved )
    it('should return an Object that contains the user\'s information (approved account)', async function() {     
        expect(await authService.loginUser('admin@home.com', 'root')).to.be.an('Object').that.has.property('account_uuid');
    })

    //Should return 'Bad password attempt' error message, this tests and account that has already been approved
    it('should return \'Bad password attempt\' error message (approved account)', async function() {
        let email = 'admin@home.com';

        try {
            expect(await authService.loginUser(email, 'password')).to.be.an('Error');
        } catch (error) {
            expect(error.message).to.equal('Login User Error: Bad Password attempt for: '+email);
        }
    })

    //Should return 'No User Found...' error message, this tests and account that has not yet been added to the database
    it('should return \'No User Found...\' error message (unapproved account)', async function() {
        let email = 'nouser@home.com'

        try {
            expect(await authService.loginUser(email, 'root')).to.be.an('Error');  
        } catch (error) {           
            expect(error.message).to.equal('No User Found with email: '+email);
        } 
    })

    //Test for added but unapproved user
})
