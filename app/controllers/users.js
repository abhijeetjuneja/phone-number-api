var mongoose = require('mongoose');
var express = require('express');
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');
var jwt = require('jsonwebtoken');
var secret = require('./../../config/config').secret;
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var crudCheck = require('./../../middlewares/crudCredentialCheck');
var adminCheck = require('./../../middlewares/adminCheck');
var viewAllAdminCheck = require('./../../middlewares/viewAllAdminCheck');



module.exports.controllerFunction = function(app) {


    //Get all users
    userRouter.get('/all',detail.getDetails,viewAllAdminCheck.checkCredentials,function(req,res){

        //begin user find
        userModel.find({}).select("email name mobileNumber").exec(function(err,allUsers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If no users found
                if(allUsers == null || allUsers[0] == undefined || allUsers.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No users found",200,null,allUsers);
                    res.json(myResponse);
                }
                //If users found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched Users",200,null,allUsers);
                    res.json(myResponse);
                }         
               

            }

        });//end user model find 

    });//end get all users


    //Get user by id
    userRouter.get('/view/:userId',detail.getDetails,crudCheck.checkCredentials,function(req,res){

        //begin user find
        userModel.findOne({'_id':req.params.userId}).select('email name').exec(function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If user not found
                if(user == null || user == undefined)
                {
                    var myResponse = responseGenerator.generate(true,"No users found",200,null,null);
                    res.json(myResponse);
                }
                else
                {
                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched user",200,null,user);
                    res.json(myResponse);
                }                     
            }
        });//end user model find 

    });//end get user by id


    //Get user details through middleware
    userRouter.get('/me',detail.getDetails,function(req,res){
        
        res.json(req.details);

    });


    //Signup
    userRouter.post('/create',detail.getDetails,adminCheck.checkCredentials,function(req,res){

        //Verify body parameters
        if(req.body.name!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                name                : req.body.name,
                email               : req.body.email,
                password            : req.body.password

            });// end new user 

            if(req.body.admin != undefined && req.body.admin != null)
                newUser.admin = req.body.admin;

            //Save user
            newUser.save(function(err,newUser){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if name is valid
                        if(err.errors.name){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,400,null,null);
                            res.status(400).json(myResponse);
                        } else
                        //Check if email is valid 
                        if(err.errors.email){
                            var myResponse = responseGenerator.generate(true,err.errors.email.message,400,null,null);
                            res.status(400).json(myResponse);
                        }
                        //Check if password is valid
                          else if(err.errors.password){
                            var myResponse = responseGenerator.generate(true,err.errors.password.message,400,null,null);
                            res.status(400).json(myResponse);
                        }
                    }
                    else if(err){
                        //If error code 11000 duplicate email
                        if(err.code==11000){
                            var myResponse = responseGenerator.generate(true,'Email already exists',400,null,null);
                            res.status(400).json(myResponse);
                        }
                        else{
                            var myResponse = responseGenerator.generate(true,err.errmsg,400,null,null);
                            res.status(400).json(myResponse);
                        } 
                        
                    }
                    
                    

                }
                //If no errors
                else{                    
                    var myResponse = responseGenerator.generate(false,"Signed Up Successfully",200,null,null);
                    res.status(200).json(myResponse);
                }

            });//end new user save


        }
        //Form fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 400,
                data: null
            };

            res.status(400).json(myResponse);

        }
        

    });//end signup


    //Login
    userRouter.post('/login',function(req,res){

        //begin user find
        userModel.findOne({'email':req.body.email}).select('email password name mobileNumber admin').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                res.json(myResponse);

            }
            //If user not found
            else if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(true,"Could not authenticate user",404,null,null);
                res.json(myResponse);

            }
            else
            {
                //Check if password exists
                if(req.body.password){

                    //Decrypt and compare password the Database
                    var validPassword = foundUser.comparePassword(req.body.password);
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
                    var token = jwt.sign({email:foundUser.email, name : foundUser.name , mobile : foundUser.mobileNumber,userId:foundUser._id , admin : foundUser.admin},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Login Successfull",200,token,null);
                    res.json(myResponse); 
                }

            }
        });
    });

    //Edit a user by Id
    userRouter.put('/:userId/edit',detail.getDetails,crudCheck.checkCredentials,function (req, res) {

        //Get all changes
        var changes = req.body;

        //Begin user update
        userModel.findOne({'_id':req.params.userId},changes,{new: true},function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred.Check all parameters."+err,500,null,null);
                res.json(myResponse); 
            }
            else
            {
                if(changes.name) user.name = changes.name;
                if(changes.email) user.email = changes.email;
                if(changes.password) user.password = changes.password;
                if(changes.admin) user.admin = changes.admin;
                user.save(function(err,user){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Some error occurred.Check all parameters."+err,500,null,null);
                        res.json(myResponse); 
                    }
                    else
                    {
                        var myResponse = responseGenerator.generate(false,"Successfully edited user",200,null,user);
                        res.json(myResponse); 
                    }
                    
                });           
                
            }
        });//end user update
        
    });//end edit user



    //Delete user by id.Admin section
    userRouter.post('/:userId/delete',detail.getDetails,viewAllAdminCheck.checkCredentials,function(req,res){
        
        //Remove user
        userModel.remove({'_id':req.params.userId},function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted user",200,null,null);
                res.json(myResponse);
            }
        });//end remove


    });//end remove user

    


    //name api
    app.use('/users', userRouter);



 
};//end contoller code
