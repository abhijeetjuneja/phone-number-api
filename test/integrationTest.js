//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
var numberModel = require('../app/models/number');
var userModel = require('../app/models/user');
var userModel = require('../app/models/user');

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
describe('users Test', () => {
	var token = '';
	var userId = '';
	var numberId = '';
    before((done) => { //Before each test we empty the database
    	var user = new userModel({
    		name  : 'Abhijeet juneja',
    		email : 'abcas@gmail.com',
    		password : 'abcABC1@'
    	});
    	user.save(function(err,user){            
            if (err) throw new Error('Expected not to receive an error');
            else{
            	userId = user._id;
                done();
            }
        });


    });

    describe('LOGIN user', () => {
      it('it should not login user with invalid email and password', (done) => {
        var user = {
            email : 'abcas@gmail.com',
    		password : 'abcABC1asdd@'
        }
        chai.request(server)
            .post('/users/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(user)
            .end((err, res) => {
            	if (err) throw new Error('Expected not to receive an error');
            	res.body.message.should.equal('Could not authenticate password.Invalid password');
                res.body.should.be.a('object');
                res.body.should.have.property('error');
              done();
            });
      });

    });

    describe('LOGIN user', () => {
      it('it should login user with valid email and password', (done) => {
        var user = {
            email : 'abcas@gmail.com',
    		password : 'abcABC1@'
        }
        chai.request(server)
            .post('/users/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('x-access-token',token)
            .send(user)
            .end((err, res) => {
            	if (err) throw new Error('Expected not to receive an error');
            	token  = res.body.token;
            	res.body.message.should.equal('Login Successfull');
                res.body.should.be.a('object');
                res.body.should.have.property('error');
              done();
            });
      });

    });

    describe('Get Details user', () => {
      it('it should return error as user is not logged in', (done) => {
        chai.request(server)
            .get('/users/me')
            .set('content-type', 'application/x-www-form-urlencoded')
            .end((err, res) => {
            	res.body.message.should.equal('No token provided');
                res.body.should.be.a('object');
                res.body.should.have.property('error');
              done();
            });
      });

    });

    describe('Get Details user', () => {
      it('it should return user details as user is logged in', (done) => {
        chai.request(server)
            .get('/users/me')
            .set('x-access-token',token)
            .end((err, res) => {
            	if (err) throw new Error('Expected not to receive an error');
                res.body.should.be.a('object');
                res.body.should.have.property('name');
              done();
            });
      });

    });


    describe('Add Numbers', () => {
      it('it should not add numbers as user is not logged in', (done) => {
        chai.request(server)
            .post('/numbers/'+userId+'/create')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({'mobileNumber':'1234567890'})
            .end((err, res) => {
            	res.body.message.should.equal('No token provided');
                res.body.should.be.a('object');
              done();
            });
      });

    });

    describe('Add Numbers', () => {
      it('it should add numbers as user is logged in', (done) => {
        chai.request(server)
            .post('/numbers/'+userId+'/create')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('x-access-token',token)
            .send({'mobileNumber':'1234567892'})
            .end((err, res) => {
            	res.body.message.should.equal('Created Number');
                res.body.should.be.a('object');
              done();
            });
      });
    });

    describe('Get Numbers', () => {
      it('it should not get numbers as user is not logged in', (done) => {
        chai.request(server)
            .get('/numbers/'+userId+'/view')
            .end((err, res) => {
            	res.body.message.should.equal('No token provided');
                res.body.should.be.a('object');
              done();
            });
      });

    });

    describe('Get Numbers', () => {
      it('it should get numbers as user is logged in', (done) => {
        chai.request(server)
            .get('/numbers/'+userId+'/view')
            .set('x-access-token',token)
            .end((err, res) => {
            	res.body.message.should.equal("Fetched numbers.Append '?page=1' or '?page=n' and so on for next and prev results.");
                res.body.should.be.a('object');
                numberId = res.body.numbers[0]._id;
              done();
            });
      });
    });

    describe('Edit Numbers', () => {
      it('it should not edit numbers as user is not logged in', (done) => {
        chai.request(server)
            .put('/numbers/'+userId+'/'+numberId+'/edit')
            .send({'mobileNumber':'1234567892'})
            .end((err, res) => {
            	res.body.message.should.equal('No token provided');
                res.body.should.be.a('object');
              done();
            });
      });

    });

    describe('Edit Numbers', () => {
      it('it should edit numbers as user is logged in', (done) => {
        chai.request(server)
            .put('/numbers/'+userId+'/'+numberId+'/edit')
            .set('x-access-token',token)
            .send({'mobileNumber':'1234567892'})
            .end((err, res) => {
            	res.body.message.should.equal("Successfully edited number");
                res.body.should.be.a('object');
              done();
            });
      });
    });

    describe('Delete Number', () => {
      it('it should not delete number as user is not logged in', (done) => {
        chai.request(server)
            .post('/numbers/'+userId+'/'+numberId+'/delete')
            .end((err, res) => {
            	res.body.message.should.equal('No token provided');
                res.body.should.be.a('object');
              done();
            });
      });

    });

    describe('Delete Number', () => {
      it('it should delete number as user is logged in', (done) => {
        chai.request(server)
            .post('/numbers/'+userId+'/'+numberId+'/delete')
            .set('x-access-token',token)
            .end((err, res) => {
            	res.body.message.should.equal("Successfully deleted number");
                res.body.should.be.a('object');
              done();
            });
      });
    });

    after((done) => {
    	userModel.remove({}, (err) => { 
           numberModel.remove({},(err) =>{
           		done();
           });         
        });     
    });

});
