

exports.checkCredentials = function(req,res,next){

	if(req.details.admin)
	{
		next();
	}
	else
		res.status(403).json({error:true,message : 'Permission denied'});
};