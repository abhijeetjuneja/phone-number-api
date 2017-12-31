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


//Create client schema and validation
var clientSchema = new Schema({

	name  			  : {type:String,default:'',required:true,validate: validator.name},
	email	  			: {type:String,default:'',required:true,unique:true,validate: validator.email},
	password			: {type:String,default:'',required:true,validate:validator.password},
  admin         : {type:Boolean}

});

//Before saving encrypt password
clientSchema.pre('save', function(next) {
  var client=this;
  bcrypt.hash(client.password, null, null, function(err, hash) {
    // Store hash in password DB.
    if(err)
    	return next(err);
    client.password=hash;
  	next();
  });
});


// Attach titlize
clientSchema.plugin(titlize, {
  paths: [ 'name' ]
});


//Compare password by decryption
clientSchema.methods.comparePassword =  function(password) {
    return bcrypt.compareSync(password,this.password);
};


module.exports = mongoose.model('Client',clientSchema);

