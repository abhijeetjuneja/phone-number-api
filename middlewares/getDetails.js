var jwt = require('jsonwebtoken');
var secret = require('./../config/config').secret;

//Send decoded data from json token
exports.getDetails = function(req,res,next){

	console.log(req);
	//Check for token in body and headers
	var token = req.body.token || req.body.query || req.headers['x-access-token'];

	//If token is provided
	if(token){

		jwt.verify(token,secret,function(err,decoded){
			if(err){
				res.status(401).json({error:true,message:'Invalid Token'});
			}
			else{
				req.details=decoded;
				next();
			}
		});
	}

	//If token not found
	else{
		res.status(404).json({error:true,message:'No token provided'});
	}

};