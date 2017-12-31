//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var numberModel = require('../app/models/number');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var httpMocks = require('node-mocks-http');
var server = require('../server');
var should = chai.should();
var responseGenerator = require('../libs/responseGenerator');
var detail = require('../middlewares/getDetails');
var crudCheck = require('../middlewares/crudCredentialCheck');
var adminCheck = require('../middlewares/adminCheck');
var pagination = require('../middlewares/pagination');
var userOrAdmin = require('../middlewares/userOrAdmin');
var viewAllAdminCheck = require('../middlewares/viewAllAdminCheck');
var numberCheck = require('../middlewares/numberCheck');

chai.use(chaiHttp);


//Our parent block
describe('Unit Tests', () => {


    describe('viewAllAdminCheck module', () => {
        var request = httpMocks.createRequest({
                method: 'GET',
                details:{
                    admin:false
                }
            });
        var response = httpMocks.createResponse();
        it('it should return error if user is not Admin', (done) => {
            viewAllAdminCheck.checkCredentials(request, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(403);
            done();
        });

        var req = httpMocks.createRequest({
                method: 'GET',
                details:{
                    admin:true
                }
            });
        it('it should call next() if user is Admin', (done) => {
            viewAllAdminCheck.checkCredentials(req, response , function(next){
                done();
            });
            throw new Error('Expected not to receive an error');
        });
    });

    describe('getDetails module', () => {
        var request = httpMocks.createRequest({
                method: 'GET'
            });
        var response = httpMocks.createResponse();
        it('it should return 404 as no token is provided', (done) => {
            detail.getDetails(request, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(404);
            done();
        });

        var req = httpMocks.createRequest({
                method: 'GET',
                headers: {
                    'x-access-token' :'sfdfdfdfd'
                }
            });
        it('it should return 401 as token is invalid', (done) => {
            detail.getDetails(req, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(401);
            done();
            
        });
    });

    describe('userOrAdmin module', () => {
        var request = httpMocks.createRequest({
                method: 'GET',
                details:{
                    clientId:""
                }
            });
        var response = httpMocks.createResponse();
        it('it should return 403 as the person is a client', (done) => {
            userOrAdmin.checkCredentials(request, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(403);
            done();
        });

        var req = httpMocks.createRequest({
                method: 'GET',
                details : {
                    userId : '1234'
                },
                params : {
                    userId : '5678'
                }
            });
        it('it should return 403 as person is user but wants to access another users info', (done) => {
            userOrAdmin.checkCredentials(req, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(403);
            done();
            
        });

        var req1 = httpMocks.createRequest({
                method: 'GET',
                details : {
                    userId : '1234'
                },
                params : {
                    userId : '1234'
                }
            });
        it('it should call next() as ids are same and user is allowed', (done) => {
            userOrAdmin.checkCredentials(req1, response , function(next){
                done();
            });     
            throw new Error('Expected not to receive an error');       
        });

        var req2 = httpMocks.createRequest({
                method: 'GET',
                details : {
                    userId : '1234',
                    admin : true
                }
            });
        it('it should call next() as it is admin', (done) => {
            userOrAdmin.checkCredentials(req2, response , function(next){
                done();
            });       
            throw new Error('Expected not to receive an error');     
        });
    });


    describe('adminCheck module', () => {
        var request = httpMocks.createRequest({
                method: 'GET',
                body: {
                    admin:true
                },
                details: {
                    admin  : false,
                    userId : '1234'
                }
            });
        var response = httpMocks.createResponse();
        it('it should call next() and set admin to false as userId is present', (done) => {
            adminCheck.checkCredentials(request, response , function(next){
                expect(request.body.admin).to.equal(false);
                done();
            });
            throw new Error('Expected not to receive an error');
        });

        var req = httpMocks.createRequest({
                method: 'GET',
                body: {
                    admin  : true
                },
                details: {
                    admin  : false
                }
            });
        it('it should call next() and set admin to false as userId is not present', (done) => {
            adminCheck.checkCredentials(req, response , function(next){
                expect(request.body.admin).to.equal(false);
                done();
            });
            throw new Error('Expected not to receive an error');
        });

    });


    describe('crudCredentialCheck module', () => {
        var request = httpMocks.createRequest({
                method: 'GET',
                details: {
                    clientId : '1234',
                },
                params: {
                    clientId : '5678'
                }
            });
        var response = httpMocks.createResponse();
        it('it should return 403 error as client is not authorized', (done) => {
            crudCheck.checkCredentials(request, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(403);
            done();
        });

        var request1 = httpMocks.createRequest({
                method: 'GET',
                details: {
                    clientId : '1234',
                },
                params: {
                    clientId : '1234'
                }
            });
        var response = httpMocks.createResponse();
        it('it should call next() as client is authorized', (done) => {
            crudCheck.checkCredentials(request1, response , function(next){
                done();
            });
            throw new Error('Expected not to receive an error');
        });

        var request2 = httpMocks.createRequest({
                method: 'GET',
                details: {
                    userId : '1234',
                    admin:true
                },
                params: {
                    userId : '12334'
                }
            });
        var response = httpMocks.createResponse();
        it('it should call next() as it is admin', (done) => {
            crudCheck.checkCredentials(request2, response , function(next){
                done();
            });
            throw new Error('Expected not to receive an error');
        });

        var request3 = httpMocks.createRequest({
                method: 'GET',
                details: {
                    userId : '1234',
                    admin:false
                },
                params: {
                    userId : '12334'
                }
            });
        var response = httpMocks.createResponse();
        it('it should return 403 error as user is not authorized', (done) => {
            crudCheck.checkCredentials(request3, response , function(next){
                throw new Error('Expected not to receive an error');
            });
            expect(response.statusCode).to.equal(403);
            done();
        });

        var request4 = httpMocks.createRequest({
                method: 'GET',
                details: {
                    userId : '1234',
                    admin:false
                },
                params: {
                    userId : '1234'
                }
            });
        var response = httpMocks.createResponse();
        it('it should call next() as user is authorized', (done) => {
            crudCheck.checkCredentials(request4, response , function(next){
                done();
            });
            throw new Error('Expected not to receive an error');
        });



    });


    //Our parent block
    describe('Clients Test', () => {
        before((done) => { //Before each test we empty the database
            var client = {
                name  : 'Abhijeet juneja',
                email : 'abc@gmail.com',
                password : 'abcABC1@'
            };
            chai.request(server)
                .post('/book')
                .send(client)
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
        });


        after((done) => { //Before each test we empty the database
            clientModel.remove({}, (err) => { 
               done();         
            });     
        });

    });




});

