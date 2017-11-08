'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

require('colors');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MigrationModel = void 0;

_bluebird2.default.config({
  warnings: false
});

var es6Template = '\nasync function up () {\n\n}\n\nasync function down () {\n\n}\n\nmodule.exports = {\n  up,\n  down\n};\n';

var Migrator = function () {
  function Migrator(_ref) {
    var templatePath = _ref.templatePath,
        _ref$migrationsPath = _ref.migrationsPath,
        migrationsPath = _ref$migrationsPath === undefined ? './migrations' : _ref$migrationsPath,
        dbConnectionUri = _ref.dbConnectionUri,
        _ref$collectionName = _ref.collectionName,
        collectionName = _ref$collectionName === undefined ? 'migrations' : _ref$collectionName,
        _ref$autosync = _ref.autosync,
        autosync = _ref$autosync === undefined ? false : _ref$autosync,
        _ref$cli = _ref.cli,
        cli = _ref$cli === undefined ? false : _ref$cli,
        connection = _ref.connection;
    (0, _classCallCheck3.default)(this, Migrator);

    var defaultTemplate = es6Template;
    this.template = templatePath ? _fs2.default.readFileSync(templatePath, 'utf-8') : defaultTemplate;
    this.migrationPath = _path2.default.resolve(migrationsPath);
    this.connection = connection || _mongoose2.default.connect(dbConnectionUri, { useMongoClient: true });
    this.collection = collectionName;
    this.autosync = autosync;
    this.cli = cli;
    MigrationModel = (0, _db2.default)(collectionName, this.connection);
  }

  (0, _createClass3.default)(Migrator, [{
    key: 'log',
    value: function log(logString) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force || this.cli) {
        console.log(logString);
      }
    }

    /**
     * Use your own Mongoose connection object (so you can use this('modelname')
     * @param {mongoose.connection} connection - Mongoose connection
     */

  }, {
    key: 'setMongooseConnection',
    value: function setMongooseConnection(connection) {
      MigrationModel = (0, _db2.default)(this.collection, connection);
    }

    /**
     * Close the underlying connection to mongo
     * @returns {Promise} A promise that resolves when connection is closed
     */

  }, {
    key: 'close',
    value: function close() {
      return this.connection ? this.connection.close() : _bluebird2.default.resolve();
    }

    /**
     * Create a new migration
     * @param {string} migrationName
     * @returns {Promise<Object>} A promise of the Migration created
     */

  }, {
    key: 'create',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(migrationName) {
        var existingMigration, now, newMigrationFile, migrationCreated;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return MigrationModel.findOne({ name: migrationName });

              case 3:
                existingMigration = _context.sent;

                if (!existingMigration) {
                  _context.next = 6;
                  break;
                }

                throw new Error(('There is already a migration with name \'' + migrationName + '\' in the database').red);

              case 6:
                _context.next = 8;
                return this.sync();

              case 8:
                now = Date.now();
                newMigrationFile = now + '-' + migrationName + '.js';

                _mkdirp2.default.sync(this.migrationPath);
                _fs2.default.writeFileSync(_path2.default.join(this.migrationPath, newMigrationFile), this.template);
                // create instance in db
                _context.next = 14;
                return this.connection;

              case 14:
                _context.next = 16;
                return MigrationModel.create({
                  name: migrationName,
                  createdAt: now
                });

              case 16:
                migrationCreated = _context.sent;

                this.log('Created migration ' + migrationName + ' in ' + this.migrationPath + '.');
                return _context.abrupt('return', migrationCreated);

              case 21:
                _context.prev = 21;
                _context.t0 = _context['catch'](0);

                this.log(_context.t0.stack);
                fileRequired(_context.t0);

              case 25:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 21]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Runs migrations up to or down to a given migration name
     *
     * @param migrationName
     * @param direction
     */

  }, {
    key: 'run',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _this = this;

        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'up';
        var migrationName = arguments[1];

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration;

        return _regenerator2.default.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.sync();

              case 2:
                if (!(direction !== 'up' && direction !== 'down')) {
                  _context3.next = 4;
                  break;
                }

                throw new Error('The \'' + direction + '\' is not supported, use the \'up\' or \'down\' direction');

              case 4:
                if (!migrationName) {
                  _context3.next = 10;
                  break;
                }

                _context3.next = 7;
                return MigrationModel.findOne({ name: migrationName });

              case 7:
                _context3.t0 = _context3.sent;
                _context3.next = 13;
                break;

              case 10:
                _context3.next = 12;
                return MigrationModel.findOne().sort({ createdAt: direction === 'up' ? -1 : 1 });

              case 12:
                _context3.t0 = _context3.sent;

              case 13:
                untilMigration = _context3.t0;

                if (untilMigration) {
                  _context3.next = 20;
                  break;
                }

                if (!migrationName) {
                  _context3.next = 19;
                  break;
                }

                throw new ReferenceError("Could not find that migration in the database");

              case 19:
                throw new Error("There are no pending migrations.");

              case 20:
                query = {
                  createdAt: { $lte: untilMigration.createdAt },
                  state: 'down'
                };


                if (direction == 'down') {
                  query = {
                    createdAt: { $gte: untilMigration.createdAt },
                    state: 'up'
                  };
                }

                sortDirection = direction == 'up' ? 1 : -1;
                _context3.next = 25;
                return MigrationModel.find(query).sort({ createdAt: sortDirection });

              case 25:
                migrationsToRun = _context3.sent;

                if (migrationsToRun.length) {
                  _context3.next = 34;
                  break;
                }

                if (!this.cli) {
                  _context3.next = 33;
                  break;
                }

                this.log('There are no migrations to run'.yellow);
                this.log('Current Migrations\' Statuses: ');
                _context3.next = 32;
                return this.list();

              case 32:
                return _context3.abrupt('return', []);

              case 33:
                throw new Error('There are no migrations to run');

              case 34:
                self = this;
                numMigrationsRan = 0;
                migrationsRan = [];
                _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(migration) {
                  var migrationFilePath, migrationFunctions;
                  return _regenerator2.default.wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);
                          migrationFunctions = void 0;
                          _context2.prev = 2;

                          migrationFunctions = require(migrationFilePath);
                          _context2.next = 10;
                          break;

                        case 6:
                          _context2.prev = 6;
                          _context2.t0 = _context2['catch'](2);

                          _context2.t0.message = _context2.t0.message && /Unexpected token/.test(_context2.t0.message) ? 'Unexpected Token when parsing migration.' : _context2.t0.message;
                          throw _context2.t0;

                        case 10:
                          if (migrationFunctions[direction]) {
                            _context2.next = 12;
                            break;
                          }

                          throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

                        case 12:
                          _context2.prev = 12;
                          _context2.next = 15;
                          return new _bluebird2.default(function (resolve, reject) {
                            var callPromise = migrationFunctions[direction].call(_this.connection.model.bind(_this.connection), function callback(err) {
                              if (err) return reject(err);
                              resolve();
                            });

                            if (callPromise && typeof callPromise.then === 'function') {
                              callPromise.then(resolve).catch(reject);
                            }
                          });

                        case 15:

                          _this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                          _context2.next = 18;
                          return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

                        case 18:
                          migrationsRan.push(migration.toJSON());
                          numMigrationsRan++;
                          _context2.next = 27;
                          break;

                        case 22:
                          _context2.prev = 22;
                          _context2.t1 = _context2['catch'](12);

                          _this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                          _this.log('Not continuing. Make sure your data is in consistent state'.red);
                          throw _context2.t1 instanceof Error ? _context2.t1 : new Error(_context2.t1);

                        case 27:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _loop, _this, [[2, 6], [12, 22]]);
                });
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 41;
                _iterator = migrationsToRun[Symbol.iterator]();

              case 43:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context3.next = 49;
                  break;
                }

                migration = _step.value;
                return _context3.delegateYield(_loop(migration), 't1', 46);

              case 46:
                _iteratorNormalCompletion = true;
                _context3.next = 43;
                break;

              case 49:
                _context3.next = 55;
                break;

              case 51:
                _context3.prev = 51;
                _context3.t2 = _context3['catch'](41);
                _didIteratorError = true;
                _iteratorError = _context3.t2;

              case 55:
                _context3.prev = 55;
                _context3.prev = 56;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 58:
                _context3.prev = 58;

                if (!_didIteratorError) {
                  _context3.next = 61;
                  break;
                }

                throw _iteratorError;

              case 61:
                return _context3.finish(58);

              case 62:
                return _context3.finish(55);

              case 63:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context3.abrupt('return', migrationsRan);

              case 65:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee2, this, [[41, 51, 55, 63], [56,, 58, 62]]);
      }));

      function run() {
        return _ref3.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Looks at the file system migrations and imports any migrations that are
     * on the file system but missing in the database into the database
     *
     * This functionality is opposite of prune()
     */

  }, {
    key: 'sync',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var _this2 = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context5.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context5.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js$/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                filesNotInDb = _lodash2.default.filter(migrationsInFolder, { existsInDatabase: false }).map(function (f) {
                  return f.filename;
                });
                migrationsToImport = filesNotInDb;

                this.log('Synchronizing database with file system migrations...');

                if (!(!this.autosync && migrationsToImport.length)) {
                  _context5.next = 14;
                  break;
                }

                _context5.next = 12;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the migrations folder but not in the database. Select the ones you want to import into the database',
                    name: 'migrationsToImport',
                    choices: filesNotInDb
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 12:
                answers = _context5.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context5.abrupt('return', _bluebird2.default.map(migrationsToImport, function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(migrationToImport) {
                    var filePath, timestampSeparatorIndex, timestamp, migrationName, createdMigration;
                    return _regenerator2.default.wrap(function _callee3$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            filePath = _path2.default.join(_this2.migrationPath, migrationToImport), timestampSeparatorIndex = migrationToImport.indexOf('-'), timestamp = migrationToImport.slice(0, timestampSeparatorIndex), migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));


                            _this2.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                            _context4.next = 4;
                            return MigrationModel.create({
                              name: migrationName,
                              createdAt: timestamp
                            });

                          case 4:
                            createdMigration = _context4.sent;
                            return _context4.abrupt('return', createdMigration.toJSON());

                          case 6:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x4) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context5.t0;

              case 21:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee4, this, [[0, 17]]);
      }));

      function sync() {
        return _ref4.apply(this, arguments);
      }

      return sync;
    }()

    /**
     * Opposite of sync().
     * Removes files in migration directory which don't exist in database.
     */

  }, {
    key: 'prune',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, dbMigrationsNotOnFs, migrationsToDelete, answers, migrationsToDeleteDocs;
        return _regenerator2.default.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context6.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context6.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                dbMigrationsNotOnFs = _lodash2.default.filter(migrationsInDatabase, function (m) {
                  return !_lodash2.default.find(migrationsInFolder, { filename: m.filename });
                });
                migrationsToDelete = dbMigrationsNotOnFs.map(function (m) {
                  return m.name;
                });

                if (!(!this.autosync && !!migrationsToDelete.length)) {
                  _context6.next = 13;
                  break;
                }

                _context6.next = 11;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the database but not in the migrations folder. Select the ones you want to remove from the file system.',
                    name: 'migrationsToDelete',
                    choices: migrationsToDelete
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 11:
                answers = _context6.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context6.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context6.sent;

                if (!migrationsToDelete.length) {
                  _context6.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context6.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context6.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context6.prev = 23;
                _context6.t0 = _context6['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context6.t0;

              case 27:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee5, this, [[0, 23]]);
      }));

      function prune() {
        return _ref6.apply(this, arguments);
      }

      return prune;
    }()

    /**
     * Lists the current migrations and their statuses
     * @returns {Promise<Array<Object>>}
     * @example
     *   [
     *    { name: 'my-migration', filename: '149213223424_my-migration.js', state: 'up' },
     *    { name: 'add-cows', filename: '149213223453_add-cows.js', state: 'down' }
     *   ]
     */

  }, {
    key: 'list',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var _this3 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.sync();

              case 2:
                _context7.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context7.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context7.abrupt('return', migrations.map(function (m) {
                  _this3.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee6, this);
      }));

      function list() {
        return _ref7.apply(this, arguments);
      }

      return list;
    }()
  }]);
  return Migrator;
}();

exports.default = Migrator;


function fileRequired(error) {
  if (error && error.code == 'ENOENT') {
    throw new ReferenceError('Could not find any files at path \'' + error.path + '\'');
  }
}

module.exports = Migrator;