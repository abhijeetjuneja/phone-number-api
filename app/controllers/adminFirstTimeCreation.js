var mongoose = require('mongoose');
var express = require('express');
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');
var jwt = require('jsonwebtoken');
var responseGenerator = require('./../../libs/responseGenerator');



module.exports.controllerFunction = function(app) {

    //Signup
    userRouter.post('/create',function(req,res){

        //Verify body parameters
        if(req.body.name!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                name                : req.body.name,
                email               : req.body.email,
                password            : req.body.password,
                admin               : true

            });// end new user 

            //Save user
            newUser.save(function(err,newUser){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if name is valid
                        if(err.errors.name){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,err.code,null,null);
                            res.json(myResponse);
                        } else
                        //Check if email is valid 
                        if(err.errors.email){
                            var myResponse = responseGenerator.generate(true,err.errors.email.message,err.code,null,null);
                            res.json(myResponse);
                        }
                        //Check if password is valid
                          else if(err.errors.password){
                            var myResponse = responseGenerator.generate(true,err.errors.password.message,err.code,null,null);
                            res.json(myResponse);
                        }
                    }
                    else if(err){
                        //If error code 11000 duplicate email
                        if(err.code==11000){
                            var myResponse = responseGenerator.generate(true,'Email already exists',err.code,null,null);
                            res.json(myResponse);
                        }
                        else{
                            var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null,null);
                            res.json(myResponse);
                        } 
                        
                    }
                    
                    

                }
                //If no errors
                else{                    
                    var myResponse = responseGenerator.generate(false,"Signup Up Successfully",200,null,null);
                    res.json(myResponse);
                }

            });//end new user save


        }
        //Form fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            res.json(myResponse);

        }
        

    });//end signup


    //name api
    app.use('/admin', userRouter);



 
};//end contoller code
