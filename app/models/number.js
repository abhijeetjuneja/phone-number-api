// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt=require('bcrypt-nodejs');
// declare schema object.
var Schema = mongoose.Schema;
var titlize = require('mongoose-title-case');

//Get validators from libs
var validator = require('./../../libs/validator');


//Create number schema and validation
var numberSchema = new Schema({

    userId          : {type:String,required:true},  
    mobileNumber    : {type:String,validate:validator.mobile}

});



module.exports = mongoose.model('Number',numberSchema);

