/**
 * Voicemail Main module unit tests.
 *
 * @module tests-voicemail-main
 * @copyright 2014, Digium, Inc.
 * @license Apache License, Version 2.0
 * @author Samuel Fortier-Galarneau <sgalarneau@digium.com>
 */

'use strict';

/*global describe:false*/
/*global beforeEach:false*/
/*global afterEach:false*/
/*global it:false*/

var util = require('util');
var Emitter = require('events').EventEmitter;
var assert = require('assert');

var mockery = require('mockery');
var Q = require('q');
var pw = require('process-watch');

var config = require('../config.json');

var mockClient;
// milliseconds to delay async ops for mock requests
var asyncDelay = 100;
var mockeryOpts = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
};
// used to track whether fsm was created after StasisStart event
var fsmCreated = false;
// last logged error
var lastError;

/**
 * Returns a mock client that to allow a single EventEmitter to be
 * used for testing.
 *
 * The mock client is cached so tests can access it to emit events if
 * necessary.
 */
var getMockClient = function() {

  if (mockClient) {
    return mockClient;
  }

  var Client = function() {
    this.start = function() {
      var self = this;

      process.nextTick(function() {
        self.emit('StasisStart');
      });
    };
  };
  util.inherits(Client, Emitter);

  mockClient = new Client();

  return mockClient;
};

/**
 * Mock Voicemail FSM for testing.
 */
var getMockFsm = function() {
  return configure;

  function configure() {
    var fsm = {
      create: function(event, channel) {
        fsmCreated = true;
      }
    };

    return fsm;
  }
};

describe('voicemail-main', function() {

  beforeEach(function(done) {

    mockery.enable(mockeryOpts);

    var clientMock = {
      getClient: function(config, appName) {
        var deferred = Q.defer();

        if (config.url && config.username &&
            config.password && appName) {
          deferred.resolve(getMockClient());
        }

        return deferred.promise;
      }
    };
    var loggingMock = {
      create: function() {
        return {
          trace: function() {},
          debug: function() {},
          info: function() {},
          warn: function() {},
          error: function(err) {
            lastError = err;
          },
          fatal: function() {},
          child: function() {
            return this;
          }
        };
      }
    };

    mockery.registerMock('ari-client-wrapper', clientMock);
    mockery.registerMock('voicemail-logging', loggingMock);
    mockery.registerMock('voicemail-main-fsm', getMockFsm());

    done();
  });

  afterEach(function(done) {
    mockery.disable();
    fsmCreated = false;

    done();
  });

  it('should configure StasisStart handler', function(done) {
    var voicemailMain = require('../lib/voicemail-main.js');

    voicemailMain.create();
    checkSuccess();
    getMockClient().start();

    // call done if fsm was created
    function checkSuccess() {
      setTimeout(function() {
        if (fsmCreated) {
          done();
        } else{
          checkSuccess();
        }
      }, asyncDelay);
    }
  });

  it('should restart up to maxRestarts', function(done) {

    require('../start.js');

    var watched = pw.watch('node app.js', process.pid)
      .started(kill)
      .restarted(kill)
      .error(done)
      .start();

    checkSuccess();

    function kill() {
      watched.kill();
    }

    function checkSuccess() {
      if (lastError === 'app.js has exited after reaching max restarts') {
        done();
      } else {
        setTimeout(checkSuccess, asyncDelay);
      }
    }
  });

});
