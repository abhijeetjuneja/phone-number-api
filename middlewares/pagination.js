var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var numberModel = mongoose.model('Number');
// articles per page
var limit = 10;

// pagination middleware function sets some
// local view variables that any view can use
exports.pagination = function(req, res, next) {

    var page = parseInt(req.params.page) || 1,
        num = page * limit;
    numberModel.count({'userId':req.params.userId},function(err,total){
        if(err){
            var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
            console.log(myResponse);
            res.json(myResponse);
         }
        else
        {
            next();
        }
    });//end remove

}