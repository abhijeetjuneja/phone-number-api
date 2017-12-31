var mongoose = require('mongoose');
var express = require('express');
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var clientRouter  = express.Router();
var clientModel = mongoose.model('Client');
var jwt = require('jsonwebtoken');
var secret = require('./../../config/config').secret;
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var crudCheck = require('./../../middlewares/crudCredentialCheck');
var adminCheck = require('./../../middlewares/adminCheck');
var viewAllAdminCheck = require('./../../middlewares/viewAllAdminCheck');


module.exports.controllerFunction = function(app) {


    //Get all clients
    clientRouter.get('/all',detail.getDetails,viewAllAdminCheck.checkCredentials,function(req,res){

        //begin client find
        clientModel.find({}).select("email name mobileNumber").exec(function(err,allclients){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If no clients found
                if(allclients == null || allclients[0] == undefined || allclients.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No clients found",200,null,allclients);
                    res.json(myResponse);
                }
                //If clients found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched clients",200,null,allclients);
                    res.json(myResponse);
                }         
               

            }

        });//end client model find 

    });//end get all clients


    //Get client by id
    clientRouter.get('/view/:clientId',detail.getDetails,crudCheck.checkCredentials,function(req,res){

        //begin client find
        clientModel.findOne({'_id':req.params.clientId}).select('email name').exec(function(err,client){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If client not found
                if(client == null || client == undefined)
                {
                    var myResponse = responseGenerator.generate(true,"No clients found",200,null,null);
                    res.json(myResponse);
                }
                else
                {
                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched client",200,null,client);
                    res.json(myResponse);
                }                     
            }

        });//end client model find 

    });//end get client by id


    //Signup
    clientRouter.post('/signup',function(req,res){

        //Verify body parameters
        if(req.body.name!=undefined && req.body.email!=undefined && req.body.password!=undefined ){

            var newclient = new clientModel({
                name                : req.body.name,
                email               : req.body.email,
                password            : req.body.password


            });// end new client 

            //Save client
            newclient.save(function(err,newclient){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if name is valid
                        if(err.errors.name){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,err.code,null,null);
                            res.status(400).json(myResponse);
                        } else
                        //Check if email is valid 
                        if(err.errors.email){
                            var myResponse = responseGenerator.generate(true,err.errors.email.message,err.code,null,null);
                            res.status(400).json(myResponse);
                        } 
                        //Check if password is valid
                          else if(err.errors.password){
                            var myResponse = responseGenerator.generate(true,err.errors.password.message,err.code,null,null);
                            res.status(400).json(myResponse);
                        }
                    }
                    else if(err){
                        //If error code 11000 duplicate email
                        if(err.code==11000){
                            var myResponse = responseGenerator.generate(true,'Email already exists',err.code,null,null);
                            res.status(11000).json(myResponse);
                        }
                        else{
                            var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null,null);
                            res.status(400).json(myResponse);
                        } 
                        
                    }
                    
                    

                }
                //If no errors
                else{
                    //Sign JWT Token
                    var token = jwt.sign({email:newclient.email, name : newclient.name , mobile : newclient.mobileNumber,clientId:newclient._id},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Signup Up Successfully",200,token,null);
                    res.status(200).json(myResponse);
                }

            });//end new client save


        }
        //Form fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            res.status(400).json(myResponse);

        }
        

    });//end signup



    //Login
    clientRouter.post('/login',function(req,res){

        //begin client find
        clientModel.findOne({'email':req.body.email}).select('email password name').exec(function(err,foundclient){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                res.json(myResponse);

            }
            //If client not found
            else if(foundclient==null || foundclient==undefined || foundclient.email == undefined){

                var myResponse = responseGenerator.generate(true,"Could not authenticate client",404,null,null);
                res.json(myResponse);

            }
            else
            {
                //Check if password exists
                if(req.body.password){

                    //Decrypt and compare password the Database
                    var validPassword = foundclient.comparePassword(req.body.password);
                }
                //No password provided 
                else {
                    var myResponse = responseGenerator.generate(true,"No password provided",404,null,null);
                    res.json(myResponse); 
                }
                //If password doesn't match
                if(!validPassword)
                {
                    var myResponse = responseGenerator.generate(true,"Could not authenticate password.Invalid password",404,null,null);
                    res.json(myResponse); 
                }
                //If password matches
                else
                {
                    //Sign JWT token
                    var token = jwt.sign({email:foundclient.email, name : foundclient.name , mobile : foundclient.mobileNumber,clientId:foundclient._id},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Login Successfull",200,token,null);
                    res.json(myResponse); 
                }

            }
        });
    });


    //Edit a client by Id
    clientRouter.put('/:clientId/edit',detail.getDetails,crudCheck.checkCredentials,function (req, res) {

        //Get all changes
        var changes = req.body;

        //Begin client update
        clientModel.findOne({'_id':req.params.clientId},changes,{new: true},function(err,client){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred.Check all parameters."+err,500,null,null);
                res.json(myResponse); 
            }
            else
            {
                if(changes.name) client.name = changes.name;
                if(changes.email) client.email = changes.email;
                if(changes.password) client.password = changes.password;
                client.save(function(err,client){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Some error occurred.Check all parameters."+err,500,null,null);
                        res.json(myResponse); 
                    }
                    else
                    {
                        var myResponse = responseGenerator.generate(false,"Successfully edited client",200,null,client);
                        res.json(myResponse); 
                    }
                    
                });           
                
            }
        });//end client update
        
    });//end edit client


    //Delete client by id.Admin section
    clientRouter.post('/:clientId/delete',detail.getDetails,adminCheck.checkCredentials,function(req,res){
        
        //Remove client
        clientModel.remove({'_id':req.params.clientId},function(err,client){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted client",200,null,null);
                res.json(myResponse);
            }
        });//end remove


    });//end remove client

    //Get client details through middleware
    clientRouter.post('/me',detail.getDetails,function(req,res){
        
        res.json(req.details);

    });


    //name api
    app.use('/clients', clientRouter);



 
};//end contoller code
