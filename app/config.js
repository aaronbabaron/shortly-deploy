var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to mongodb');
});

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
});

var linkSchema = mongoose.Schema({
  _user: { type: Number, ref: 'User' },
  url: String,
  baseURL: String,
  code: String,
  title: String,
  visits: { type: Number, default: 0 }
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.methods.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    });
};

/* link */ initialize = function() {
  this.on('creating', function(model, attrs, options) {
    var shasum = crypto.createHash('sha1');
    shasum.update(model.get('url'));
    model.set('code', shasum.digest('hex').slice(0, 5));
  });
};

exports.userSchema = userSchema;
exports.linkSchema = linkSchema;
exports.connection = mongoose;