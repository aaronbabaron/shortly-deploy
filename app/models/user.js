var mongoose = require('../config');

var User = mongoose.connection.model('User', mongoose.userSchema);

module.exports = User;
