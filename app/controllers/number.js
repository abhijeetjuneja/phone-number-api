var mongoose = require('mongoose');
var express = require('express');
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var numberRouter  = express.Router();
var numberModel = mongoose.model('Number');
var paginate = require('express-paginate');
var jwt = require('jsonwebtoken');
var secret = require('./../../config/config').secret;
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var crudCheck = require('./../../middlewares/crudCredentialCheck');
var adminCheck = require('./../../middlewares/adminCheck');
var pagination = require('./../../middlewares/pagination');
var userOrAdmin = require('./../../middlewares/userOrAdmin');
var viewAllAdminCheck = require('./../../middlewares/viewAllAdminCheck');
var numberCheck = require('./../../middlewares/numberCheck');


module.exports.controllerFunction = function(app) {


    //Get all numbers
    numberRouter.get('/all',detail.getDetails,viewAllAdminCheck.checkCredentials,function(req,res){

        //begin number find
        numberModel.find({}).select("userId mobileNumber").exec(function(err,allnumbers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If no numbers found
                if(allnumbers == null || allnumbers[0] == undefined || allnumbers.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No numbers found",200,null,allnumbers);
                    res.json(myResponse);
                }
                //If numbers found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched numbers",200,null,allnumbers);
                    res.json(myResponse);
                }         
               

            }

        });//end number model find 

    });//end get all numbers


    //Get number by id
    numberRouter.get('/:userId/view',detail.getDetails,userOrAdmin.checkCredentials,paginate.middleware(10, 50),function(req,res){

        var page = req.query.page || 1;
        var main=this;

        numberModel.count({'userId':req.params.userId},function(err,count){
            if(err) {
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);
                res.json( {myResponse});
            }
            else{
                main.count = count;
            }
        });
        //begin number find
        numberModel.find({'userId':req.params.userId}).select('userId mobileNumber').limit(req.query.limit).skip(req.skip).lean().exec(function(err,number){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If number not found
                if(number == null || number == undefined)
                {
                    var myResponse = responseGenerator.generate(true,"No numbers found",200,null,null);
                    res.json(myResponse);
                }
                else
                {
                    var pageCount = Math.ceil(main.count / req.query.limit);
                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched number",200,null,number);
                    res.json({error:false,message:"Fetched numbers.Append '?page=1' or '?page=n' and so on for next and prev results.",status:200,numbers:number,currentPage: page,has_more: paginate.hasNextPages(req)(pageCount)});
                }                     
            }

        });//end number model find 

    });//end get number by id


    //Get number by id
    numberRouter.get('/:userId/view/:numberId',detail.getDetails,userOrAdmin.checkCredentials,function(req,res){

        //begin number find
        numberModel.findOne({'_id':req.params.numberId}).select('userId mobileNumber').exec(function(err,number){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If number not found
                if(number == null || number == undefined)
                {
                    var myResponse = responseGenerator.generate(true,"No numbers found",200,null,null);
                    res.json(myResponse);
                }
                else
                {
                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched number",200,null,number);
                    res.json(myResponse);
                }                     
            }

        });//end number model find 

    });//end get number by id


    //Signup
    numberRouter.post('/:userId/create',detail.getDetails,userOrAdmin.checkCredentials,numberCheck.check,function(req,res){

        //Verify body parameters
        if(req.body.mobileNumber!=undefined){

            var newnumber = new numberModel({
                userId                : req.params.userId,
                mobileNumber          : req.body.mobileNumber

            });// end new number 

            //Save number
            newnumber.save(function(err,newnumber){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if number is valid 
                        if(err.errors.mobileNumber){
                            var myResponse = responseGenerator.generate(true,err.errors.mobileNumber.message,err.code,null,null);
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
                    var myResponse = responseGenerator.generate(false,"Created Number",200,null,null);
                    res.json(myResponse);
                }

            });//end new number save


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




    //Edit a number by Id
    numberRouter.put('/:userId/:numberId/edit',detail.getDetails,userOrAdmin.checkCredentials,function (req, res) {

        //Get all changes
        var changes = req.body;

        //Begin number update
        numberModel.findOneAndUpdate({'_id':req.params.numberId},changes,{new: true},function(err,number){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred.Check all parameters."+err,500,null,null);
                res.json(myResponse); 
            }
            else
            {           
                var myResponse = responseGenerator.generate(false,"Successfully edited number",200,null,number);
                res.json(myResponse); 
            }
        });//end number update
        
    });//end edit number


    //Delete number by id.Admin section
    numberRouter.post('/:userId/:numberId/delete',detail.getDetails,userOrAdmin.checkCredentials,function(req,res){
        
        //Remove number
        numberModel.remove({'_id':req.params.numberId},function(err,number){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted number",200,null,null);
                res.json(myResponse);
            }
        });//end remove


    });//end remove number


    //name api
    app.use('/numbers', numberRouter);



 
};//end contoller code
