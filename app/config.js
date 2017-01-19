var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');

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

userSchema.pre('save', function(next) {
  if (this.isNew) {
    var cipher = Promise.promisify(bcrypt.hash);
    cipher(this.get('password'), null, null).bind(this)
      .then(function(hash) {
        this.password = hash;
        next();
      });
  }
  next();
});

linkSchema.pre('save', function(next) {
  if (this.isNew) {
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
  }
  next();
});

exports.userSchema = userSchema;
exports.linkSchema = linkSchema;
exports.connection = mongoose;
