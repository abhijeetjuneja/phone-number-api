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


//Create user schema and validation
var userSchema = new Schema({

	name  			  : {type:String,default:'',required:true,validate: validator.name},
	email	  			: {type:String,default:'',required:true,unique:true,validate: validator.email},
	mobileNumber  : [{type:String,validate: validator.mobile}],
	password			: {type:String,default:'',required:true,validate:validator.password},
  admin         : {type:Boolean,default:false}

});

//Before saving encrypt password
userSchema.pre('save', function(next) {
  var user=this;
  bcrypt.hash(user.password, null, null, function(err, hash) {
    // Store hash in password DB.
    if(err)
    	return next(err);
    user.password=hash;
  	next();
  });
});


// Attach titlize
userSchema.plugin(titlize, {
  paths: [ 'name' ]
});


//Compare password by decryption
userSchema.methods.comparePassword =  function(password) {
    return bcrypt.compareSync(password,this.password);
};


module.exports = mongoose.model('User',userSchema);

