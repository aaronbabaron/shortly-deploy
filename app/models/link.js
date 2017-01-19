var mongoose = require('../config');

var Link = mongoose.connection.model('Link', mongoose.linkSchema);

module.exports = Link;

