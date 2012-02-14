// Generated by IcedCoffeeScript 1.2.0j
(function() {
  var Database, GameServer, HOST, PORT, Player, acceptingAnswers, app, arrayContainerPlayer, config, configs, everyauth, express, fs, gameserver, http, iced, io, logError, parseCookie, scoreboard, store, sys, url, util, __iced_k;

  iced = require('iced-coffee-script').iced;
  __iced_k = function() {};

  sys = require('sys');

  express = require('express');

  io = require('socket.io');

  fs = require('fs');

  util = require('util');

  everyauth = require('everyauth');

  http = require('http');

  url = require('url');

  parseCookie = require('connect').utils.parseCookie;

  config = global.config = require('./config');

  /* Classes
  */


  Player = require('./classes/player');

  GameServer = require('./lib/gameserver');

  Database = require('./lib/database');

  configs = require('./lib/configs');

  store = global.store = new Database(config.database.host, config.database.port, config.database.dbindex, config.database.auth);

  HOST = config.server.host;

  PORT = config.server.port;

  process.on("uncaughtException", function(err) {
    console.log("UNCAUGHT EXCEPTION:");
    return console.log(err.stack);
  });

  /* Util
  */


  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };

  arrayContainerPlayer = function(a, name) {
    var i;
    i = a.length;
    while (i--) {
      if (a[i].name === name) return true;
    }
    return false;
  };

  /* Everyauth
  */


  configs.everyauthConfig(everyauth);

  /* Server
  */


  app = express.createServer();

  configs.expressConfig(express, config, app, everyauth);

  /* Handle Connections
  */


  scoreboard = [];

  acceptingAnswers = false;

  io = io.listen(app);

  /* Error Handling
  */


  logError = function(error, socket) {
    throw error;
  };

  /* Start Server
  */


  gameserver = new GameServer(io);

  gameserver.startGame();

  app.get('/', function(req, res) {
    return res.render('index', {
      host: config.server.host,
      port: config.server.port
    });
  });

  app.get('/highscore', function(req, res) {
    return res.render('highscore', {
      list: gameserver.highscore
    });
  });

  app.get('/profile/:id', function(req, res) {
    var data, ___iced_passed_deferral, __iced_deferrals,
      _this = this;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "/Users/dhoelzgen/Develop/JavaScript/Node/Hackerspursuit/server.coffee"
      });
      gameserver.getProfileData(req.params.id, __iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return data = arguments[0];
          };
        })(),
        lineno: 72
      }));
      __iced_deferrals._fulfill();
    })(function() {
      return res.render('profile', data);
    });
  });

  app.get('/image/:id', function(req, res) {
    var err, profileImageUrl, proxy, proxyRequest, userData, ___iced_passed_deferral, __iced_deferrals,
      _this = this;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "/Users/dhoelzgen/Develop/JavaScript/Node/Hackerspursuit/server.coffee"
      });
      store.users.findById(req.params.id, __iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            err = arguments[0];
            return userData = arguments[1];
          };
        })(),
        lineno: 77
      }));
      __iced_deferrals._fulfill();
    })(function() {
      profileImageUrl = url.parse(url.parse);
      proxy = http.createClient(80, 'twitimg.com');
      proxyRequest = proxy.request('GET', userData.profile_image_url);
      proxyRequest.addListener('response', function(proxyResponse) {
        proxyResponse.addListener('data', function(chunk) {
          return res.write(chunk, 'binary');
        });
        proxyResponse.addListener('end', function() {
          return res.end();
        });
        return res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      });
      return proxyRequest.end();
    });
  });

  app.get('/user/auth-socket\.json', function(req, res) {
    var client, player, user;
    res.writeHead(200, {
      "Content-Type": "application/json"
    });
    if (req.loggedIn) {
      if (req.query && req.query.hasOwnProperty("id")) {
        user = req.user;
        client = gameserver.getClientById(req.query.id);
        if (client) {
          player = new Player(client, user);
          gameserver.joinPlayer(player);
          client.authenticated = true;
          client.join("nerds");
          return res.end(JSON.stringify({
            success: true,
            error: null
          }));
        } else {
          return res.end(JSON.stringify({
            success: false,
            error: "id not found"
          }));
        }
      } else {
        return res.end(JSON.stringify({
          success: false,
          error: "insufficient parameters given"
        }));
      }
    } else {
      return res.end(JSON.stringify({
        success: false,
        error: "not logged in"
      }));
    }
  });

  app.listen(PORT);

  sys.puts("Started server in " + app.settings.env + " mode, listening to port " + PORT + ".");

}).call(this);
