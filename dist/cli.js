'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

require('colors');

var _lib = require('./lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _yargs$usage$demand$d = _yargs2.default.usage("Usage: migrate -d <mongo-uri> [[create|up|down <migration-name>]|list] [optional options]").demand(1).default('config', 'migrate').config('config', 'filepath to an options configuration json file', function (pathToConfigFile) {
  // Get any args from env vars
  var envs = process.env;
  var envVarOptions = {};
  Object.keys(envs).map(function (key) {
    if (key.includes('MIGRATE_')) {
      var _key$match = key.match(/MIGRATE_(.*$)/),
          _key$match2 = (0, _slicedToArray3.default)(_key$match, 2),
          option = _key$match2[1];

      envVarOptions[option] = envs[key];
    }
  });

  var configOptions = {};
  try {
    configOptions = require(pathToConfigFile);
  } catch (err) {/* noop */}
  return Object.assign({}, configOptions, envVarOptions);
}).command('list'.cyan, 'Lists all migrations and their current state.').example('$0 list').command('create <migration-name>'.cyan, 'Creates a new migration file.').example('$0 create add_users').command('up [migration-name]'.cyan, 'Migrates all the migration files that have not yet been run in chronological order. ' + 'Not including [migration-name] will run UP on all migrations that are in a DOWN state.').example('$0 up add_user').command('down <migration-name>'.cyan, 'Rolls back migrations down to given name (if down function was provided)').example('$0 down delete_names').command('prune'.cyan, 'Allows you to delete extraneous migrations by removing extraneous local migration files/database migrations.').example('$0 prune').option('collection', {
  type: 'string',
  default: 'migrations',
  description: 'The collection to use for the migrations',
  nargs: 1
}).option('d', {
  demand: true,
  type: 'string',
  alias: 'dbConnectionUri',
  description: 'The URI of the database connection'.yellow,
  nargs: 1
}).option('es6', {
  type: 'boolean',
  description: 'use es6 migration template?'
}).option('md', {
  alias: 'migrations-dir',
  description: 'The path to the migration files',
  normalize: true,
  default: './migrations',
  nargs: 1
}).option('t', {
  alias: 'template-file',
  description: 'The template file to use when creating a migration',
  type: 'string',
  normalize: true,
  nargs: 1
}).option('c', {
  alias: 'change-dir',
  type: 'string',
  normalize: 'true',
  description: 'Change current working directory before running anything',
  nargs: 1
}).option('autosync', {
  type: 'boolean',
  description: 'Automatically add new migrations in the migrations folder to the database instead of asking interactively'
}).option('enable', {
  type: 'boolean',
  description: 'Set to false if you want to do a dry run'
}).help('h').alias('h', 'help'),
    args = _yargs$usage$demand$d.argv;

// Destructure the command and following argument


var _args$_ = (0, _slicedToArray3.default)(args._, 2),
    command = _args$_[0],
    _args$_$ = _args$_[1],
    migrationName = _args$_$ === undefined ? args['migration-name'] : _args$_$;

if (!command) process.exit(1);

// Change directory before anything if the option was provided
if (args.c) process.chdir(args.c);

// Make sure we have a connection URI
if (!args.dbConnectionUri) {
  console.error('You need to provide the Mongo URI to persist migration status.\nUse option --dbConnectionUri / -d to provide the URI.'.red);
  process.exit(1);
}

var migrator = new _lib2.default({
  migrationsPath: _path2.default.resolve(args['migrations-dir']),
  templatePath: args['template-file'],
  dbConnectionUri: args.dbConnectionUri,
  es6Templates: args.es6,
  collectionName: args.collection,
  autosync: args.autosync,
  enable: args.enable,
  cli: true
});

process.on('SIGINT', function () {
  migrator.close().then(function () {
    process.exit(0);
  });
});

process.on('exit', function () {
  // NOTE: This is probably useless since close is async and 'exit' does not wait for the code to finish before
  // exiting ther process, so it's a race condition between exiting and closing.
  migrator.close();
});

var promise = void 0;
switch (command) {
  case 'create':
    validateSubArgs({ min: 1, max: 1, desc: 'You must provide only the name of the migration to create.'.red });
    promise = migrator.create(migrationName);
    promise.then(function () {
      console.log('Migration created. Run ' + ('mongoose-migrate up ' + migrationName).cyan + ' to apply the migration.');
    });
    break;
  case 'up':
    validateSubArgs({ max: 1, desc: 'Command "up" takes 0 or 1 arguments'.red });
    promise = migrator.run('up', migrationName);
    break;
  case 'down':
    validateSubArgs({ min: 1, max: 1, desc: 'You must provide the name of the migration to stop at when migrating down.'.red });
    promise = migrator.run('down', migrationName);
    break;
  case 'list':
    validateSubArgs({ max: 0, desc: 'Command "list" does not take any arguments'.yellow });
    promise = migrator.list();
    break;
  case 'prune':
    validateSubArgs({ max: 0, desc: 'Command "prune" does not take any arguments'.yellow });
    promise = migrator.prune();
    break;
  default:
    _yargs2.default.showHelp();
    process.exit(0);
}

promise.then(function () {
  process.exit(0);
}).catch(function (err) {
  console.warn(err.message.yellow);
  process.exit(1);
});

function validateSubArgs(_ref) {
  var _ref$min = _ref.min,
      min = _ref$min === undefined ? 0 : _ref$min,
      _ref$max = _ref.max,
      max = _ref$max === undefined ? Infinity : _ref$max,
      desc = _ref.desc;

  var argsLen = args._.length - 1;
  if (argsLen < min || argsLen > max) {
    _yargs2.default.showHelp();
    console.error(desc);
    process.exit(-1);
  }
}