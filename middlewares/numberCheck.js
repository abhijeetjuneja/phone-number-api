var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var numberModel = mongoose.model('Number');

exports.check = function(req, res, next) {

    numberModel.findOne({'mobileNumber':req.body.mobileNumber},function(err,number){
        if(err){
            res.json({error:true,message:'Some error occurred'});
         }
        else
        {
            if(number == null){
                next();
            }
            else{
                res.json({error:true,message:'Number exists'});
            }
        }
    });//end remove

}