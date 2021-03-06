(function() {
  var randOrd;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  randOrd = function() {
    return Math.round(Math.random()) - 0.5;
  };
  $(document).ready(function() {
    var addAlert, addBadge, badgeQueue, connect, displayingBadge, kicked, listEntry, loaded, ownUserId, processBadges, progess_dna, progress_starter, sendAnswer, socket, startGame, started;
    soundManager.url = "/swfs/";
    soundManager.onready(function() {
      soundManager.createSound({
        id: 'wrong',
        url: ['/sounds/wrong.mp3', '/sounds/wrong.acc', '/sounds/wrong.ogg'],
        autoLoad: true
      });
      return soundManager.createSound({
        id: 'correct',
        url: ['/sounds/correct.mp3', '/sounds/correct.acc', '/sounds/correct.ogg'],
        autoLoad: true
      });
    });
    /* Communication */
    socket = null;
    started = false;
    loaded = false;
    kicked = false;
    progress_starter = false;
    progess_dna = false;
    ownUserId = null;
    badgeQueue = [];
    displayingBadge = false;
    startGame = function() {
      $('#view-login').hide();
      return $('#view-wait').fadeIn();
    };
    connect = function() {
      socket = io.connect(host, {
        'port': parseInt(port)
      });
      socket.on("profile.info", function(profile) {
        $('#profile-name').text(profile.name.substring(0, 8));
        $('#canvas-container').pixelize(profile.profileImage);
        return ownUserId = profile.id;
      });
      socket.on("scoreboard", function(scoreboard) {
        var entry, listEntry, rank, _i, _len, _results;
        $('#scoreboard li').remove();
        rank = 0;
        _results = [];
        for (_i = 0, _len = scoreboard.length; _i < _len; _i++) {
          entry = scoreboard[_i];
          rank += 1;
          _results.push(rank < 11 ? (listEntry = $('<li>').append($('<a>').attr({
            href: "/profile/" + entry.userId,
            target: "_blank"
          }).html("" + entry.points + " " + (entry.name.substring(0, 8)))), $('#scoreboard').append(listEntry)) : entry.userId === ownUserId ? (listEntry = $('<li>').css('padding-left', '24px').css('margin', '8px 0px').html(".<br />.<br />"), $('#scoreboard').append(listEntry), listEntry = $('<li>').append($('<a>').attr({
            href: "/profile/" + entry.userId,
            target: "_blank"
          }).html("" + entry.points + " " + (entry.name.substring(0, 8)))), $('#scoreboard').append(listEntry)) : void 0);
        }
        return _results;
      });
      socket.on("chat.msg", function(result) {
        return listEntry(result.name, result.msg);
      });
      socket.on("badge.new", function(badge) {
        return addBadge(badge);
      });
      socket.on("progress.starter", function(percent) {
        if (progress_starter !== true) {
          progress_starter = true;
          $('#progress-starter').fadeIn();
        }
        return $('#bar-starter').css('width', "" + percent + "%");
      });
      socket.on("progress.dna", function(dnaData) {
        var progress, progress_dna, _i, _len, _results;
        if (progress_starter === true) {
          progress_starter = false;
          progress_dna = true;
          $('#progress-starter').fadeOut(function() {
            return $('#progress-dna').fadeIn();
          });
        } else if (progess_dna === false) {
          progess_dna = true;
          $('#progress-dna').fadeIn();
        }
        _results = [];
        for (_i = 0, _len = dnaData.length; _i < _len; _i++) {
          progress = dnaData[_i];
          _results.push($("#bar-" + progress.name).css('width', "" + progress.progress + "%"));
        }
        return _results;
      });
      socket.on("disconnect", function() {
        if (!kicked) {
          $('#header-countwait').html("Trying to reconnect");
          $('#countwait').html("Pease stand by...");
          $('#view-game, #view-prepare').hide();
          $('#chat-msg, .caption').css('display', 'none');
          $('.chat').css('background-color', '#92a486');
          $('.display').removeClass('stripes');
          $('#view-wait').fadeIn();
          return started = false;
        }
      });
      return socket.on("connect", function() {
        var id;
        id = socket.socket.sessionid;
        return $.getJSON("/user/auth-socket.json?id=" + id, __bind(function(data) {
          startGame();
          if (loaded) {
            return;
          }
          if (data.success) {
            socket.on("question.prepare", function(question) {
              var color, i, step;
              if (!started) {
                $('#view-wait').hide();
                $('#view-game').fadeIn();
                $('.display').addClass('stripes');
                $('#canvas-container').fadeIn();
                i = 0;
                step = 0;
                while (i < 800) {
                  if (step % 2 === 0) {
                    color = '#e4f9d7';
                  } else {
                    color = '#92a486';
                  }
                  (function(color) {
                    return window.setTimeout(function() {
                      return $('.chat').css('background-color', color);
                    }, i);
                  })(color);
                  step += 1;
                  i += Math.random() * 100;
                }
                window.setTimeout(function() {
                  $('.chat').css('background-color', '#e4f9d7');
                  $('#chat-msg').css('display', 'inline-block');
                  return $('.caption').css('display', 'inline-block');
                }, i + 100);
                setTimeout(function() {
                  return listEntry("System", "Navigate to <a href=\"/highscore\" target=\"_blank\">/highscore</a> for overall score");
                }, 3000);
                started = true;
                loaded = true;
              }
              $('#question-category').text("Next question is about " + question.category);
              $('#question-author').text("by " + question.createdBy);
              $('#question-pane').hide();
              return $('#prepare-pane').fadeIn();
            });
            socket.on("question.new", function(question) {
              var answer, keys;
              if (!started) {
                return;
              }
              $('#prepare-pane').hide();
              $('#question-pane').fadeIn();
              $('.correct').removeClass("correct");
              $('.wrong').removeClass("wrong");
              $('.selected').removeClass('selected');
              for (answer = 1; answer <= 4; answer++) {
                $('#a' + answer).fadeIn('fast');
              }
              $('#category').text("" + question.subCategory + " / " + question.category);
              $('#question').text("" + question.text);
              keys = [1, 2, 3, 4];
              keys.sort(randOrd);
              $('#a1').attr("data-answer", keys[0]).removeClass("selected").html(question['a' + keys[0]].replace(/\ /, '&nbsp;'));
              $('#a2').attr("data-answer", keys[1]).removeClass("selected").html(question['a' + keys[1]].replace(/\ /, '&nbsp;'));
              $('#a3').attr("data-answer", keys[2]).removeClass("selected").html(question['a' + keys[2]].replace(/\ /, '&nbsp;'));
              return $('#a4').attr("data-answer", keys[3]).removeClass("selected").html(question['a' + keys[3]].replace(/\ /, '&nbsp;'));
            });
            socket.on("answer.correct", function(answer) {
              console.log(answer);
              $('ul#answers li div[data-answer=' + answer + ']').addClass("selected correct");
              return soundManager.play("correct");
            });
            socket.on("answer.wrong", function(answer) {
              $('ul#answers li div[data-answer=' + answer + ']').addClass("selected wrong");
              return soundManager.play("wrong");
            });
            socket.on("answer.twice", function() {
              return addAlert("You already selected an answer.");
            });
            socket.on("answer.over", function() {
              return addAlert("Time is over.");
            });
            socket.on("question.countdown", function(seconds) {
              if (started) {
                return $('#countdown').html(seconds);
              } else {
                return $('#countwait').html("JOINING IN " + seconds + " SECONDS...");
              }
            });
            socket.on("question.wait", function(result) {
              var answer, correct, _results;
              correct = result.correct;
              if (!started) {
                $('#countwait').html("Good luck!");
              }
              $('#countdown').html("0");
              _results = [];
              for (answer = 1; answer <= 4; answer++) {
                _results.push(correct !== ("a" + answer) ? $('ul#answers li div[data-answer=' + answer + ']').fadeOut() : void 0);
              }
              return _results;
            });
            return socket.on("kicked", function(msg) {
              kicked = true;
              $('#header-countwait').html("Disconnected");
              $('#countwait').html("You signed in with another client");
              $('#view-game, #view-prepare, #view-chat').hide();
              $('.display').removeClass('stripes');
              $('#view-wait').fadeIn();
              return socket.disconnect();
            });
          } else {
            return alert("Could not authenticate: " + data.error);
          }
        }, this));
      });
    };
    sendAnswer = function(n) {
      if (socket == null) {
        return;
      }
      return socket.emit('answer.set', {
        answer: n
      });
    };
    /* Alerts and Notices */
    listEntry = function(name, msg) {
      var message;
      message = $('<li>').html("<div class='message-wrapper'><span class='name'>" + name + ":</span> " + msg + "</div>");
      $('#messages').prepend(message);
      return setTimeout(function() {
        message.css('height', '28px');
        if ($('#messages li').length > {
          duration: 30
        }) {
          return $('#messages li:last-child').remove();
        }
      }, 1);
    };
    addAlert = function(msg) {
      return listEntry("System", msg);
    };
    addBadge = function(badge) {
      badgeQueue.push(badge);
      if (!displayingBadge) {
        return processBadges();
      }
    };
    processBadges = function() {
      var badge;
      badge = badgeQueue.pop();
      if (badge) {
        displayingBadge = true;
        $('#badge-notify img').attr('src', "/img/" + badge.badge + ".png");
        $('#badge-notify .name').html(badge.name.substr(0, 8));
        $('#badge-notify .description').html(badge.badge.replace(/likeasir/, 'like a sir').replace(/epicfail/, 'epic fail'));
        return $('#badge-notify').fadeIn(300).delay(3000).fadeOut(300, function() {
          return processBadges();
        });
      } else {
        return displayingBadge = false;
      }
    };
    /* Buttons */
    $(document).keydown(function(event) {
      var key;
      return key = event.keyCode ? event.keyCode : event.which;
    });
    $('#a1, #a2, #a3, #a4').click(function() {
      return sendAnswer($(this).attr("data-answer"));
    });
    /* Chat */
    $('#chat-form').bind('submit', function(e) {
      var message;
      e.preventDefault();
      if (socket == null) {
        return;
      }
      message = $('#chat-msg').val();
      $('#chat-msg').val("");
      return socket.emit('chat.msg', {
        content: message
      });
    });
    /* Views */
    $('#view-game, #view-prepare, #header-countwait, #progress-starter, #progress-dna').hide();
    /* Intro */
    $('.view-content .view-wait').show();
    $('#header-countwait').show();
    return connect();
  });
}).call(this);
