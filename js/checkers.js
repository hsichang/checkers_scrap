// checklist:
//
// Create Room
// Start remote game
// Admin panel for hidden buttons like 'clear'
//
// Double Jump
// Scoreboard
// fix score bug
// Piece counter
// Game over
// Single Player

// turn is _playerTurn
$(document).ready(function() {
  var ROUTE_WELCOME = 'welcome',
      ROUTE_LOBBY   = 'lobby',
      ROUTE_GAME    = 'playing',

      CHANNEL_LOBBY = { name_system : 'changoCheckersLobby',
                        name_public : 'Lobby'
                      },
      BROADCAST_PUBLIC = 'public',
      BROADCAST_SYSTEM = 'system',

      NEW_GUEST_STYLE = 'chat-alert-new-guest';

      // deprecate
  var trace = function() { console.log('\n\nTRACE\n\n') };

  var Router = function() {
    var thisRouter = this;
  };

  Router.prototype = {
    _welcomeScreen: function(thisGame) {
      var thisRouter = this;

      thisGame._switchWindow(ROUTE_WELCOME);
      thisGame._bindWelcomeClickEvents();
    },

    _lobby: function(thisGame, name) {
      var message = { channel     : CHANNEL_LOBBY,
                      message     : "\> " + thisGame.thisPlayerName + ' has entered the lobby.',
                      callbackDiv : 'lobby-chat-text-holder' };

      thisGame._switchWindow(ROUTE_LOBBY);
      thisGame._pubnubInit(); // deprecate ?
      thisGame._broadcastManager(CHANNEL_LOBBY); // here
      thisGame._bindLobbyEvents(name);
    },

    _startPlaying: function(thisGame) {
      // all of this should be a new page
      // or a page with a deep link so user
      // can refresh the page
      // not a _blank either, for mobile ...
      // or something

      thisGame.$sendToChatLobby.unbind('click', sendToLobbyChatHandler);
      thisGame._switchWindow(ROUTE_GAME);
      gameBoard = new Board();
      gameBoard._drawNewBoard(thisGame)

      // start game -- make an option here for one or two players
      thisGame._playerTurn(gameBoard);
    },

    _gameOver: function() {

    },

    _chatRoom: function() {

    },

    _privateChat: function() {

    },

  };

  var Checkers = function() {
    var self = this;
    self.$body = $('body');
    self.$board = $('#board');
    self.$playerName = $('#playerName');
    self.$submitName = $('#submitCredentials');
    self.$player_1_move = $('#move_player_1');
    self.$player_2_move = $('#move_player_2');
    self.$debugSquareDisplay = $('#debug-display-square');

    /* lobby */
    self.$lobbyWindow = $('.lobby-chat-text-holder');
    self.$closeChat = $('.close-chat-button');
    self.$lobbyChatInput = $('#lobbyChatInputText');
    self.$sendToChatLobby = $('.send-lobby-chat-button');
    self.$lobbyChatView = $('.lobby-chat-text-holder');
    self.$createRoomBtn = $('.lobby-create-game-room-button');
    self.$createRoomInputText = $('#createGameRoomInputText');

    self.players = {};
    self.turn = null;
    self.moves = [];
    self.players =  { 1 : new Player(1),
                      2 : new Player(2) };

    self.router = new Router();

    self.router._welcomeScreen(self);
    self.broadcastChannels = [];
    self.broadcastChannels.push(CHANNEL_LOBBY);

    // self.router._startPlaying(self);  // this logic should move to route
  };

  Checkers.prototype = {
    _chat: function() {
    },

    _debug: function(evt, action) {
      var self = this,
          target = evt.target.id,
          $targetDiv = $('#' + target);

      if ($targetDiv.hasClass("legal") && action === "display-square") {
        self.$debugSquareDisplay.text("#"+target+" "+"classes: " + $targetDiv.attr("class"));
      } else {
        self.$debugSquareDisplay.text("");
      };
    },

    _switchWindow: function(ROUTE) {
      this.$body.removeClass( this.$body.attr('class') );
      this.$body.toggleClass(ROUTE);
    },

    _bindWelcomeClickEvents : function() {
      var thisGame = this,

          submitNameHandler = function(evt) {
            evt.preventDefault();
            var name = thisGame.$playerName.val()

            if (name !== '') {
              // check if valid:
              //
              // check if downcase ===
              // "admin"
              // "Player 1"
              // "Player 2"
              // "Sysadmin"
              // user
              // user 1
              // user 2
              // CPU
              // computer
              // Chang === there can be only one
              thisGame.$playerName.val('');
              thisGame.thisPlayerName = name;

              thisGame.router._lobby(thisGame, name);
              thisGame.$submitName.unbind('click');
            } else if (name === '') {
              // surface modal error.  Alert for now
              alert('Please enter a username in order to play checkers with chat.')
            }; // else if name is not valid - surface error here
          };

      thisGame.$submitName.bind('click', submitNameHandler);
      thisGame.$body.on('keypress', thisGame.$submitName, function(args) {
        if (args.keyCode === 13) {
          thisGame.$submitName.click();
          return false;
        };
      });
    },

    _bindLobbyEvents: function(name) {
      var thisGame  = this,
          message   = {},

      // make this into reusable functions at highest level
      unsubscribeFromChatHandler = function(evt) {
        evt.preventDefault();
        thisGame._unsubscribeFromChat(CHANNEL_LOBBY);
      },

      createRoomHandler = function(evt) {
        evt.preventDefault();

        if (thisGame.$createRoomInputText.val() !== '') {
          console.log(thisGame.$createRoomInputText.val());
        };

       // don't forget to push the new room into the
       // thisGame.broadcastChannels.push(CHANNEL_LOBBY)
      },

      sendToLobbyChatHandler = function(evt) {
        evt.preventDefault();

        var msg = thisGame.$lobbyChatInput.val();
        if (msg !== '') {
          message = { channel     : CHANNEL_LOBBY,
                      message     : '> ' + thisGame.thisPlayerName + ': ' + msg,
                      style       : NEW_GUEST_STYLE,
                      audience    : BROADCAST_PUBLIC,
                      callbackDiv : 'lobby-chat-text-holder'
                    }
          thisGame._broadcastMessage(message);
          thisGame.$lobbyChatInput.val('');
        };
      };

      thisGame.$closeChat.bind('click', unsubscribeFromChatHandler);

      thisGame.$sendToChatLobby.bind('click', sendToLobbyChatHandler);

      thisGame.$lobbyChatInput.on('keypress', thisGame.$sendToChatLobby, function(keypress) {
        if (keypress.keyCode === 13) {
          thisGame.$sendToChatLobby.click();
          return false;
        };
      });

      thisGame.$createRoomBtn.bind('click', createRoomHandler);

      thisGame.$createRoomInputText.on('keypress', thisGame.$createRoomBtn, function(keypress) {
        if (keypress.keyCode === 13) {
          thisGame.$createRoomBtn.click();
          return false;
        };
      });

      // dont forget to unbind these events after the lobby is exited
    },

    _movePieces: function(board, squares) {
      var thisGame    = this,
          score       = 0,
          totalScore  = 0;

      for(var square in squares) {

        board[squares[square]]._emptySquare();

        var score = 1;

        if (board[squares[square]].king) { var score = score + 2 }

        var opponent = board[squares[square]].player;

        board[squares[square]].player = null;
        board[squares[square]].availableMoves = [];
        board[squares[square]].occupied = false;

        totalScore = totalScore + score;
      };

      var player = (opponent === 1) ? 2 : 1;

      thisGame.players[player].score = thisGame.players[player].score + totalScore;
      thisGame._updateScore();
    },

    _updateScore: function() {
      var thisGame = this;

      console.log("\n\n\n\nScore:");
      console.log("Player1: " + thisGame.players[1].score + ". Player2: " + thisGame.players[2].score + "\n\n\n");
    },

    _clearEvaluatedMoves: function(board) {
      var clearFunc = function(square) {
        square.availableMoves = [];
      };
      this._evalSquareFunction(board, clearFunc);
    },

    _toggleBoard: function(state) {
      var thisGame = this;
      if (state === "playing") {
        // default to one player
      };
    },

    _broadcastManager: function(channel) {
      var thisGame = this;

      thisGame.pubnub.subscribe({
        channel: channel.name_system,
        message: thisGame._receiveBroadcast,
        heartbeat: 30 // timeout before unsubscribe in seconds
      });

      thisGame._getUserListByChannel(channel);
    },

    _receiveBroadcast : function(message) {
            console.log(message);
      var thisGame = this,
          printMessage = function(message) {

            var $targetDiv = $('.' + message.callbackDiv)
            console.log($targetDiv);
            console.log(message.message);
            console.log(message);

            jQuery('<div/>', {  class : message.style,
                                text  : message.message,
                             }).appendTo($targetDiv[0]);
          };

        if (message.audience = BROADCAST_PUBLIC) {
          printMessage(message);
        } else if (message.audience = BROADCAST_SYSTEM) {
          // system stuff... router...moves ... etc
        };

      }, // end of _receiveBroadcast

    _broadcastMessage: function(msg) {
      var thisGame = this;

      thisGame.pubnub.publish({
        channel : msg.channel.name_system,
        message : msg
      });
    },

    // move this to router and start a different one for game
    _pubnubInit: function() {
      var thisGame = this;

      thisGame.pubnub = PUBNUB.init({
        publish_key   : 'pub-63abcbc3-7727-4157-bb00-13aacb6da270',
        subscribe_key : 'sub-f189b3cc-1fb0-11e2-8766-d7feed4dee64',
        uuid: thisGame.thisPlayerName
        // add uuid: random integers and letter'
      });
    },

    _getUserListByChannel: function(channel) {
      var thisGame = this;

      thisGame.pubnub.here_now({
        channel   : channel.name_system,
        callback  : function(m) {
                      console.log(m);
                    }
      });
    },

    _unsubscribeFromChat: function(channel) {
      var thisGame = this;
      thisGame.pubnub.unsubscribe({
        channel: channel.name_system,
        message: function(m) {
          console.log(m)
        }
      });

      console.log('Unsubscribed from channel: ' + channel.name_public);
    },

    _evalSquareFunction: function(board, callbackFunc) {
      var self = this,
          player = self.turn,
          squareKeys = Object.keys(board),
          n = squareKeys.length;

      console.log(squareKeys);
      console.log(board);
      while (n--) {
        if ((squareKeys[n] !== "currentSquare") && (board[squareKeys[n]].legal_space)) {
          if (board[squareKeys[n]]._occupiedByPlayer(player)) {
            callbackFunc(board[squareKeys[n]]);
          };
        };
      };
    },

    _evaluatePlayerMoves: function(board) {
      var thisGame  = this,
          player    = thisGame.turn,
          evaluateMovesFunc = function(square) {
            square._evaluateMoves(board, player);
          };

      this._evalSquareFunction(board, evaluateMovesFunc);
    },

    _playerTurn : function(gameBoard) {
      var thisGame = this,
          $squares = $('.square');

      console.log("\nNew turn\nPlayer: " + thisGame.turn);

      thisGame._evaluatePlayerMoves(gameBoard);       // start the turn by populating available moves

      // if (player 1 !== 'cpu') { } // add this line here
      /* note - game has just STARTED -- it should say it is anticipating an action */

      $squares.on("click", function(evt) {
        var targetSquare = gameBoard[evt.currentTarget.id];

        if ( !targetSquare._active() ) {

          if ( (targetSquare._occupiedByPlayer(thisGame.turn)) && (targetSquare.availableMoves.length > 0) ){
            gameBoard._clearHighlights();
            gameBoard._highlightAvailableMoves(targetSquare);
          } else {                              // targetSquare is not active or clickable - clear
            gameBoard._clearHighlights();
          };
        };

        if (targetSquare._active()) {                     // target square is clickable - move
          gameBoard._initiateMove(targetSquare, thisGame);
          thisGame._clearEvaluatedMoves(gameBoard);
          gameBoard._clearHighlights();

          if (thisGame._proceed()) {
            thisGame.turn = (thisGame.turn === 1) ? 2 : 1;

            // new turn
            console.log("\nNew turn\nPlayer: " + thisGame.turn);
            thisGame._evaluatePlayerMoves(gameBoard);       // start the turn by populating available moves
          } else {
            thisGame._gameOver();
          };
        };
      });
    },

    _proceed: function() {
      var self = this;
      opponent = (self.turn === 1) ? 2 : 1;
      return true;
    },

    _gameOver: function() {
      var self = this;
      alert("Game over.  You win!");
    },

  }; /* end of Checkers.prototype */

  var Board = function() {
    var self = this;
  };

  Board.prototype = {
    _drawNewBoard: function(checkersGame) {
      var thisGame = checkersGame,
          rows = 8,
          cols = 8,
          legal = false,
          gameBoard = this;

      for (r=1; r<rows+1; r++) {

        thisGame.$board.append('<div id="r' + r + '" class="row"></div>');

        for (c=1; c<cols+1; c++) {
          legal_space = legal ? "legal" : "illegal";
          square_name = "c" + c + "r" + r;

          coords  = { row: r,
                      col: c };

          gameBoard._drawNewSquare(square_name, legal_space, coords);

          // still need to initialize not legal and not occupied //
          // populate at the end

          if ((c <= 3) && (legal)) {  // move to an initialize function
            if ( (c === 1) && (legal) ) {
              gameBoard[square_name] = new Square(square_name, coords, legal, 1, true);
            } else {
              gameBoard[square_name] = new Square(square_name, coords, legal, 1, false);
            };
          } else if ((c >= 6) && (legal)) {
            if ( (c === 8) && (legal) ) {
              gameBoard[square_name] = new Square(square_name, coords, legal, 2, true);
            } else {
              gameBoard[square_name] = new Square(square_name, coords, legal, 2, false);
            };
          } else {
            gameBoard[square_name] = new Square(square_name, coords, legal)
          };
          gameBoard[square_name]._populateSquare();

          legal = !legal;
        };
        legal = !legal;
      };

      thisGame.turn = 1;
    },

    _drawNewSquare: function(name, legal, coords) {
      square = '<div id="' + square_name+'" class="square ' + legal_space + '"></div>';
      $('#r'+coords.row).append(square);
    },

    _highlightAvailableMoves : function(square) {
      var self = this;
      square.selected = true;
      if (square.availableMoves.length > 0) {
        // has moves
        for (var openSquare in square.availableMoves) {
          self.currentSquare = square;
          $('#'+square.availableMoves[openSquare].squareID).toggleClass('highlight');
        };
      }
    },

    _clearHighlights : function() {
      var self = this;
      self.currentSquare = null;
      $('.square').removeClass('highlight');
    },

    _initiateMove: function(toSquare, game) {
      var thisBoard     = this,
          players       = game.players,
          pieces        = 0,
          fromSquare    = thisBoard.currentSquare,
          recordOfMove  = {},
          moveData      = fromSquare._findMoveBySquareId(toSquare.name),
          newKing       = toSquare._checkKing(game);

      thisBoard.currentSquare = null;

      toSquare.selected = false;
      toSquare.occupied = true;
      toSquare.player   = fromSquare.player;
      toSquare.king     = (newKing) ? true : fromSquare.king;

      if (moveData.pieces) {
        pieces = moveData.pieces
        score = game._movePieces(thisBoard, moveData.pieces);
      };

      recordOfMove = {  player: game.turn,
                        from  : fromSquare.name,
                        to    : toSquare.name,
                        pieces: moveData.pieces,
                        take  : true,
                        score1: game.players[1].score,
                        score2: game.players[2].score };

      game.moves.push(recordOfMove);
                                                          console.log("\n\n\nGame moves: ");
                                                          console.log(game.moves);
      fromSquare._emptySquare();
      toSquare._populateSquare();

      fromSquare._sane();
      toSquare._sane();
    },
  };

  var Player = function(player) {
    var self = this;

    self.player   = player;
    self.score    = 0;
    self.pieces   = 16;
    self.cpu      = false;
    self.moves    = [];
  };

  Player.prototype = {
    _addMove: function(fromSquare, toSquare, take, numberOfPieces) {
      var self = this,
          move = { from: fromSquare, to: toSquare, take: take, pieces: numberOfPieces };

      self.moves.push(move);
    },

    _addScore: function(numberOfPieces) {
      var self = this;
      self.score = this.score+numberOfPieces;
      return (self.score >=12) ? true : false;
    },

    _losePieces: function(numberOfPieces) {
      var self = this;
      self.pieces = self.pieces - numberOfPieces();
    },

  }; /* end of player prototype */

  function Square(name, coords, legal, player, king) {
    /* modify function: if you update a square it should check if sane, */
    var self = this;
    self.name               = name;
    self.coords             = coords;
    self.availableMoves     = [];
    self.legal_space        = legal;
    self.selected           = false;
    self.king1              = false;
    self.king2              = false;
    self.occupied           = (player !== undefined);

    if ( self.occupied && self.legal_space) {
      self.player           = player;
      if (self.king) { self.player === 1 ? self.king2 = true : self.king1 = true };
    };

    self._sane();
  }

  Square.prototype = {
    _sane: function() {
      var self = this;
      var msgs = [];

      if (!self.occupied && self.selected) {
        msgs.push('Cannot be occupied and selected');
      };

      if (!self.occupied && self.king) {
        msgs.push('Cannot be king and occupied simultaneously');
      };

      if (self.isBlocked && self.availableMoves.length !== 0) {
        msgs.push('Can not be blocked and have available moves');
      }

      if (msgs.length !== 0) {
        alert(self.name + ' is insane');
        for (var msg in msgs) {
          console.log("\n"+msgs[msg]);
        };
      }
    },

    _active: function() {
      var self = this;
      return $('#'+self.name).hasClass('highlight');
    },

    _checkKing: function(game) {
      var thisSquare = this;
      return ( (game.turn === 1) && thisSquare.king1 || (game.turn === 2) && thisSquare.king2);
    },

    _occupy: function() {
      var self = this;
      self.occupy = true;
      self._sane(); // sanity check
    },

    _occupiedByPlayer: function(player) {
      var self = this;
      return self.player === player
    },

    _isBlocked: function() {
      var self = this;
      return self.availableMoves.length === 0;
    },

    _playable: function() {
      var self = this;
      return self.availableMoves.length !== 0;
    },

    _populateSquare: function() {
      var thisSquare = this;

      if (thisSquare.occupied) {
        if (thisSquare.player === 1) {
          thisSquare.king ? $('#'+thisSquare.name).append('<div class="piece_1">K</div>') : $('#'+thisSquare.name).append('<div class="piece_1"></div>');
        } else if (thisSquare.player === 2) {
          thisSquare.king ? $('#'+thisSquare.name).append('<div class="piece_2">K</div>') : $('#'+thisSquare.name).append('<div class="piece_2"></div>');
        }
      };
    },

    _findMoveBySquareId: function(targetSquareId) {
      var thisSquare = this,
          allMoves = thisSquare.availableMoves;

      for (var move in thisSquare.availableMoves) {
        if (allMoves[move].squareID === targetSquareId) {
          return allMoves[move];
        };
      };

      return false;
    },

    _emptySquare: function() {
      var thisSquare = this,
          error_msg = 'Error.  This cell is not populated!';

      if (thisSquare.occupied) {
        thisSquare.selected = false;
        thisSquare.king = false;
        thisSquare.occupied = false;
        thisSquare.player = null;
        thisSquare.availableMoves = [];
        $('#'+thisSquare.name).empty();
      } else {
        alert(error_msg);
      };
    },

    _pieceDirection: function() {
      var thisSquare = this,
          kingModifier = thisSquare.king ? -1 : 1,
          direction = (thisSquare.player === 1) ? 1 : -1;

      return direction * kingModifier;
    },

    _constructMoves: function(coords, x_step, y_step, step, pieces) {
      var self    = this,
          next_x  = coords.col + x_step,
          next_y  = coords.row + y_step,
          take    = false;

      if ((next_x <= 8 && next_x >= 1) && (next_y >= 1 && next_y <= 8)) {
        if (step > 1) {
          take    = true;
          pieces  = pieces;
       };

      move = {  squareID    : "c"+next_x+"r"+next_y,
                step        : step,
                xDirection  : x_step,
                yDirection  : y_step,
                coords      : { col : next_x, row : next_y },
                next_x      : next_x,     // needed ?
                next_y      : next_y,     // needed ?
                take        : take,
                pieces      : pieces
              };

        return move;

      } else {
        return false;
      };
    },

    _occupiedByOpponent: function(player) {
      var self = this;

      return (self.occupied && (self.player !== player))
    },

    _evaluateMoves: function(board, p) {
      var thisSquare = this,
          squaresToCheck = [],
          x_dir = thisSquare._pieceDirection(),
          y_dir = [1, -1],
          step = 1;

      if (thisSquare.player === p) {
        for(var y_step in y_dir) {
          if (thisSquare._constructMoves(thisSquare.coords, x_dir, y_dir[y_step]) !== false) {
            squaresToCheck.push(thisSquare._constructMoves(thisSquare.coords, x_dir, y_dir[y_step], step));
          };
        }

        var exit = squaresToCheck.length;
        var square = 0; // change to index
        while (square < exit) {
          var pieces = [];
          step = 1;
          scope = board[squaresToCheck[square].squareID];

          if ( scope._occupiedByPlayer(p) || (scope._occupiedByOpponent(p) && (step % 2 === 0) ) ) {
            // do nothing
          } else if ( scope._occupiedByOpponent(p) ) {
            step = step + 1;
            if (step % 2 === 0) {     // single jump
              y_dir = scope.coords.row - thisSquare.coords.row;
              if (thisSquare._constructMoves(scope.coords, x_dir, y_dir, step)) {
                pieces.push(scope.name);
                squaresToCheck.push(thisSquare._constructMoves(scope.coords, x_dir, y_dir, step, pieces));
                exit = exit + 1;
              };
            } else {                   // for now for double jump

            };
          } else {                                                                    // has a move
          thisSquare.availableMoves.push(squaresToCheck[square]);
        };

        square = square + 1;  // increment loop;
        };  /* eo while (square < exit) loop */
      };
      thisSquare._sane();
    },
  };




  new Checkers();
});
