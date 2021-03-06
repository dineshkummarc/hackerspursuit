redis = require("redis")
User = require("../models/user")
Score = require("../models/score")
Badge = require("../models/badge")

module.exports = class
  constructor: (host, port, dbindex, auth, callback) ->
    @client = redis.createClient port, host, { no_ready_check: true }

    @client.on "error", (err) ->
      console.log err
    
    @client.on "connect", =>
      if not auth and dbindex is 0
        if callback? then callback()

      if auth? and auth != ""
        @client.auth auth, (err, val) =>
          if err?
            console.log err
          else
            if dbindex isnt 0
              @client.select dbindex, (err, val) =>
                if callback? then callback()
            else
              if callback? then callback()
      else
        if dbindex isnt 0
          @client.select dbindex, (err, val) =>
            if callback? then callback()
        else
          if callback? then callback()
    
    @users = new User @client
    @scores = new Score @client
    @badges = new Badge @client