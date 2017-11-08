'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'migrations';
  var dbConnection = arguments[1];


  var MigrationSchema = new _mongoose.Schema({
    name: String,
    createdAt: Date,
    state: {
      type: String,
      enum: ['down', 'up'],
      default: 'down'
    }
  }, {
    collection: collection,
    toJSON: {
      virtuals: true,
      transform: function transform(doc, ret, options) {
        delete ret._id;
        delete ret.id;
        delete ret.__v;
        return ret;
      }
    }
  });

  MigrationSchema.virtual('filename').get(function () {
    return this.createdAt.getTime() + '-' + this.name + '.js';
  });

  dbConnection.on('error', function (err) {
    console.error('MongoDB Connection Error: ' + err);
  });

  return dbConnection.model(collection, MigrationSchema);
};

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Factory function for a mongoose model
_mongoose2.default.Promise = _bluebird2.default;