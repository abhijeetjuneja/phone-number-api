//Response Generator with token

//Include mongoose-validator
var validate = require('mongoose-validator');

//Export email validator
exports.email = [
  validate({
    validator: 'isEmail',
    message: 'Not a valid Email'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

//Export name validator
exports.name = [
  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{2,20})+[ ]+([a-zA-Z]{2,20})+)+$/i,  
    message: 'Name must be atleast 3 characters,Maximum 30 characters,No special characters or numbers,Must be space between firstname and lastname'
  }),
  validate({
    validator: 'isLength',
    arguments: [4, 40],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

//Export mobile validator
exports.mobile = [
  validate({
    validator: 'matches',
    arguments: /^(0|[1-9][0-9]*)+(?!.*?[\s])+$/i,  
    message: 'Not a valid Mobile Number'
  }),
  validate({
    validator: 'isLength',
    arguments: [10],
    message: 'Mobile Number should be of 10 digits without country code'
  })
];

//Export password validator
exports.password = [
  validate({
    validator: 'matches',
    arguments: /^((?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W])(?!.*?[\s]).{8,35})+$/g,  
    message: 'Password should have atleast one special character,one number,one lowercase,one uppercase and must be atleast 8 characters long but not more than 35'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 35],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];