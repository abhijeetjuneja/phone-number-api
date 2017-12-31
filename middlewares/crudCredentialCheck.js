var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var clientModel = mongoose.model('Client');
var userModel = mongoose.model('User');

//Send decoded data from json token
exports.checkCredentials = function(req,res,next){

	if(req.details.hasOwnProperty('clientId'))
	{
		var loggedInId = req.details.clientId;
		var editId = req.params.clientId;
		if(loggedInId === editId)
			next();
		else
			res.status(403).json({error:true,message:'Permission Denied'});
	}
	else
	{
		var loggedInId = req.details.userId;
		var editId = req.params.userId;
		if(req.details.admin)
			next();
		else
		{
			if(loggedInId === editId)
				next();
			else
				res.status(403).json({error:true,message:'Permission Denied'});
		}
	}
};