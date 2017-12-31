

exports.checkCredentials = function(req,res,next){

	if(req.body.admin != undefined && req.body.admin != false)
	{
		if(req.details.hasOwnProperty('userId'))
		{
			if(req.details.admin)
				next();
			else
			{
				req.body.admin = false;
				next();
			}
			
		}
		else
		{
			req.body.admin = false;
			next();
		}
	}
	else
		next();
};