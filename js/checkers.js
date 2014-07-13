$(document).ready(function() {
  var Checkers = function() {
    var self = this;
    self.$body = $('body');
    self.$board = $('#board');
    self.$player_1_move = $('#move_player_1');
    self.$player_2_move = $('#move_player_2');
    self.$debugSquareDisplay = $('#debug-display-square');

    self.player1 = new Player(1);
    self.player2 = new Player(2);


    self.bindEvents();
  };


  var Board = function() {


  };

  Board.prototype = {
    _highlightMoves: function(moves) {


    };

  };
  /*
   * Player
   *
   * player: 1 or 2
   * pieces: number of pieces on board
   * score: number of pieces taken
   * moves: array of all moves,
   *    move number is implied: index + 1
   *    moves[ {  from: squareName,
   *              to  : squareName,
   *              take: take piece during move?
   *              pieces: numberOfPieces taken, 0 if take is false }, .. ]
   *
   * functions
   *
   * _addMove(fromSquare, toSquare, take, numberOfPieces) : adds move object to moves array
   *
   *
   *
   * _addScore(numberOfPieces) : increments self.score by numberOfPieces
   *    returns true -- if the player has won
   *    returns false -- no win, next move
   *
   * _losePieces(numberOfPieces) : reduces the number of pieces by number
   *
   *
   */

  var Player = function(player) {
    var self = this;

    self.player = player;
    self.score = 0;
    self.pieces = 16;
    self.moves = [];
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

  /* Piece may be deprecated */
  var Piece = function(player) {
    this.player = player;
  };

  /*
   * Square
   *
   *  name        : string
   *  selected    : boolean
   *  occupied    : boolean
   *  player      : integer
   *  king        : boolean
   *  avaliableMoves : array (array of square names it can highlight)
   *
   *  written functions
   *
   *  _sane
   *  _occupy - sets occupy to true
   *  _occupiedByPlayer(player) - returns true if occupied by player
   *  _isBlocked  : returns true if you can not move the piece
   *  _pieceDirection : returns the direction a piece moves (+/- 1)
   *  _playable : returns true if moves are available
   *
   *  _highlightAvailableMoves() : highlights available moves - this should probably go to a larger scope
   *
   *  write:
   *
   *  evaluateMoves : fills in availableMoves array
   *
   *
   */
  function Square(name) {
    /* modify function: if you update a square it should check if sane, */
    var self = this;
    self.name = name;
    self.selected = false;
    self.availableMoves = [];
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

    _highlightAvailableMoves: function() {
      var self = this;

    _highlightAvailableMoves : function(moves) {
      for (var move = 0; move < moves.length; move++) {
        if (moves[move] !== false) {
          moves[move].addClass('highlight')
        };
      };
    },

      console.log(self.availableMoves);




    },

    _populateSquare: function() {
      var self = this;
      if (self.occupied) {
        if (self.player === 1) {
          $('#'+self.name).append('<div class="piece_1"></div>');
        } else if (self.player === 2) {
          $('#'+self.name).append('<div class="piece_2"></div>');
        }
      } else {
        /* not occupied */
        $('#'+self.name).children().remove();
      return false;
      };
    },

    _pieceDirection: function() {
      var self = this,
          kingModifier = self.king ? -1 : 1,
          direction = (self.player === 1) ? 1 : -1;

      return direction * kingModifier;
    },

    _construct: function(origin_x, origin_y, x_step, y_step, step) {
      var self = this,
          next_x = origin_x + x_step,
          next_y = origin_y + y_step,
          move = { step: step };

      if ((next_x <= 8 && next_x >= 1) && (next_y >= 1 && next_y <= 8)) {
        move.squareID = "c"+next_x+"r"+next_y;
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
      var self = this,
          squaresToCheck = [],
          x_dir = self._pieceDirection(),
          y_dir = [1, -1],
          step = 1;


      /* avialabel moves will have to be a litle more complicated
       * currently it is an array
       *
       * it shoudl be an obkect
       *
       * [ { move:
       *     step:
       *     jump: }
      var checkJump = function() {
        console.log(y_dir);
        console.log(step);
      }


          // if it does change the squares 'playable' to true
          //
          // add an array << moves
          //
          // moves is populated by another call

      /*
       * look at where i am
       * (return location)
       *
       * check direction
       * (king === true?)
       *
       * go direction one
       * (right if not king 1)
       *
       * i go up one
       *
       *   check if free (playable ++)
       *   check if occupied by self (not playable)
       *   check if occupied by opponent (check for jump)

       * i go down one
       *
       */
      if (self.player === p) {

        for(var y_step in y_dir) {
          if (self._construct(self.coords.col, self.coords.row, x_dir, y_dir[y_step]) !== false) {
            squaresToCheck.push(self._construct(self.coords.col, self.coords.row, x_dir, y_dir[y_step], step));
          };
        }

        if (squaresToCheck.length === 0) {    // escape clause
          // self.moves = moves
        } else {                              // recursive check again
          for(var square in squaresToCheck) {
            scope = board[squaresToCheck[square].squareID];
            if ( scope._occupiedByPlayer(p) ) {
              squaresToCheck.splice(square, 1)
            } else if ( scope._occupiedByOpponent(p) ) {
              squaresToCheck.splice(squareName, 1);
              console.log(scope);
               // checkForJump();
               //   ++ add a step to the squaesToCheck but (189 y_dir.each + 1)
            } else {
              self.availableMoves.push(squaresToCheck[square].squareID);
            };

          }; /* for loop */
        }
      };
      self._sane();

      // console.log(self.availableMoves);
    },




  };

  Checkers.prototype = {
    bindEvents: function() {
      var self = this,
          testing = true;

      if (testing) {
        self._toggleBoard("playing"); /* Starts the game */
        /*
        self.$board.mousemove(function(evt) {
          self._debug(evt, "display-square");
        });
        */
      };

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

    _smartConsole : function(params) {
/*
 *    Use like this:
      params = {legal: legal, pieces: pieces};
      self._smartConsole(params);
*/
      var self = this;
      for (var v in params) {
        if (params.hasOwnProperty(v)) {
          console.log(v);
          console.log("======");
          console.log(params[v]);
          console.log("\n")
        };
      };
    },

    _toggleBoard: function(state) {
      var self = this;
      if (state === "playing") { self._buildGameBoard() };
    },

    _buildGameBoard: function() {
      var self = this;
      var gameBoard = {};
      var rows = 8;
      var cols = 8;
      var legal = false;
      var board = {};

      self.$body.toggleClass('playing');            /* routes the screen to play mode */

      for (r=1; r<rows+1; r++) {

        self.$board.append('<div id="r' + r + '" class="row"></div>');

        for (c=1; c<cols+1; c++) {
          legal_space = legal ? "legal" : "illegal";
          square_name = "c" + c + "r" + r;

          gameBoard[square_name] = new Square(square_name);
          gameBoard[square_name].legal_space = legal_space;
          gameBoard[square_name].coords = {
            row: r,
            col: c
          };

          square = '<div id="' + square_name+'" class="square ' + legal_space + '"></div>'; /* MUST separate view from this */

          $('#r'+r).append(square);
          // $('#'+square_name).data( "coords", { row: r, col: c } );    /* deprecate ? */

          if ((c <= 3) && (legal)) {
            gameBoard[square_name].player = 1;
            gameBoard[square_name].occupied = true;
            gameBoard[square_name].king = false;
            gameBoard[square_name]._populateSquare();
            gameBoard[square_name]._sane();
          } else if ((c >= 6) && (legal)) {
            gameBoard[square_name].player = 2;
            gameBoard[square_name].occupied = true;
            gameBoard[square_name].king = false;
            gameBoard[square_name]._populateSquare();
            gameBoard[square_name]._sane();
          };
          legal = !legal;
        };
        legal = !legal;
      };

      // console.log(gameBoard);
      self._game(gameBoard, 1);

    },

    _toggleOccupiedSquare : function(square_name, player) {
      $('#'+square_name).toggleClass(player);
    },

    _toggleSelectedSquare : function($square) {
      $square.toggleClass('selected');
    },

    _evaluatePlayerMoves: function(board, player) {
      var self = this;
      console.log('\nEvaluating moves for player: '+ player);

      for (var square in board) {
        if (board.hasOwnProperty(square)) {
          if (board[square]._occupiedByPlayer(player)) {
            board[square]._evaluateMoves(board, player);
          // if it is then check if it has any moves
          };
        };
      };

    },

    _game : function(gameBoard, player) {
      var self = this;
      var $squares = $('.square');

      self._evaluatePlayerMoves(gameBoard, player);       // start the turn by populating available moves

      // if (player 1 !== 'cpu') { } // add this line here



      /* note - game has just STARTED -- it should say it is anticipating an action */

      $squares.on("click", function(evt) {
        var self              = this,
            targetSquareName  = evt.currentTarget.id,
            targetSquare      = gameBoard[targetSquareName];

/*
        selected the square.


        does the square have a piece? && moves are available?
          yes
            highlight next moves

          no?
            clear all highlights
*/
        if (targetSquare._occupiedByPlayer(player)) {
          // self._clearAllHighlights();
          console.log(targetSquare);
          targetSquare._highlightAvailableMoves();

          // var availableMoves = [];
          // self._highlightAvailableMoves(availableMoves);
        };



        /* if it is playable (legal should be boolean), then you can add selected to the
         * if it is not you must do nothing ??
         * ???
         * OR
         * ???
         * clear selected
         */

      /* this is a bug.  it says: if ther is anything selected anywhere, it becomes previous selected */
      /* and it toggles to clear the selected.  you could just say: if there s a previous selected, clear
         clear selected */
      /* is that what you want to do?  to clear the selected? */

      /* GOT IT: this exists because it is using it to dumbly move from prev selected to new selected */

        if ($('.selected').length !== 0) {
        //  var $previousSelected = self._constructId($('.selected')[0].id);
        //  self._toggleSelectedSquare($previousSelected);
        };
/*
        var $squareClicked = self._constructId(evt.currentTarget.id);


        self._toggleSelectedSquare($squareClicked);

        if ( self._squareIsOccupiedBySelf($squareClicked, player) ) {
          self._clearAllHighlights();
          var availableMoves = [];
          availableMoves.push(self._evaluateNextMove($squareClicked, "rowPath_1", 1, player));
          availableMoves.push(self._evaluateNextMove($squareClicked, "rowPath_2", 1, player));
          self._highlightAvailableMoves(availableMoves);
        };

        if ( self._moveWithoutTake($squareClicked) ) {
          player = self._moveSquare( $squareClicked, $previousSelected, player, { take: false } );
        };

        if ( self._moveWithTake($squareClicked) ) {
          player = self._moveSquare( $squareClicked, $previousSelected, player, { take: true } );
        };
*/
      });
    },

    _clearAllHighlights : function() {
      $('.square').removeClass('highlight');
    },

    _moveSquare: function($targetDiv, $prevDiv, player, options) {
      var self = this;
      $prevDiv.toggleClass(player);
      $targetDiv.toggleClass(player);
      self._toggleSelectedSquare($targetDiv);
      self._clearAllHighlights();

      if (options.take) {
        data = $targetDiv.data();
        $div = $("#"+data.take);
        $div.toggleClass("take");
        $div.toggleClass(self._opponentOf(player));
      };

      self._sanityCheck();

      return (player === "player_1") ? "player_2" : "player_1";
    },

    /* TODO: note that this algorithm is not taking into account king'd pieces */
    _evaluateNextMove : function(square, rowPath, depth, player) {
      if (depth < 3) {
        var self = this;
        /* to take king into consideration make a func like:
         * directionColumn = leftOrRight($square, player);
         * if player is 1 and not king || player 2 and king = +1
         * else -1
         * */
        var directionColumn = (player === 1) ? 1 : -1;
        var directionRow = (rowPath === "rowPath_1") ? 1 : -1;
        var targetCol = square.coords.col + (directionColumn * depth);
        var targetRow = square.coords.row + (directionRow * depth);
        var $targetSquare = self._constructCoords(targetCol, targetRow);

        if ( self._squareIsLegalAndEmpty($targetSquare) && depth === 1 ) {
          return $targetSquare;
        };

        if ( self._squareIsLegalAndEmpty($targetSquare) && depth > 1 ) {
          var jumpCol = coords['col'] + directionColumn;
          var jumpRow = coords['row'] + directionRow;
          $jumpSquare = self._constructCoords(jumpCol, jumpRow);
          self._flagSquareForTake($targetSquare, $jumpSquare);
          return $targetSquare;
        };

        if (self._squareIsOccupiedByOpponentUnderMaxDepth($targetSquare, player, depth, 3)) {
          depth = depth + 1;
          return this._evaluateNextMove($square, rowPath, depth, player);
        };

        return false;
      };
    },

    _flagSquareForTake : function($newSquare, $jumpedSquare) {
                         /* bug with take.  line 189 is problem. shouldn't need a class. take never changes style. just the data. remove data after take */
      $newSquare.addClass("take");
      $newSquare.data("take", $jumpedSquare.attr("id"));
    },

    _constructCoords : function(column, row) {
      $div = $("#c"+column+"r"+row);
      return $div
    },

    _constructId : function(name) {
      $div = $("#"+name);
      return $div;
    },

    _squareIsLegal : function($targetDiv) {
      return ($targetDiv.hasClass("legal"));
    },

    _squareIsLegalAndEmpty : function($targetDiv) {
      var self = this;
      return ( self._squareIsLegal($targetDiv) && !($targetDiv.hasClass("player_1")) && !($targetDiv.hasClass("player_2")) );
    },

    _squareIsLegalAndOccupied : function($targetDiv) {
      var self = this;
      return ( self._squareIsLegal($targetDiv) && ($targetDiv.hasClass("player_1") || $targetDiv.hasClass("player_2")) );
    },

    _squareIsLegalMove : function($targetDiv) {
      return ($targetDiv.hasClass("highlight"));
    },

    _squareIsSelected : function($targetDiv) {
      return ($targetDiv.hasClass("selected"));
    },

    _squareIsOccupiedBySelf : function($targetDiv, player) {
      return ($targetDiv.hasClass(player));
    },

    _squareIsOccupiedByOpponent : function($targetDiv, thisPlayer) {
      var opponent = (thisPlayer === "player_1" ) ? "player_2" : "player_1";
      return ($targetDiv.hasClass(opponent))
    },

    _squareIsOccupiedByOpponentUnderMaxDepth : function($targetDiv, thisPlayer, depth, maxDepth) {
      var self = this;
      return ( self._squareIsOccupiedByOpponent($targetDiv, thisPlayer) && (depth < maxDepth) )

    },

    _squareIsUnplayable : function($targetDiv, player) {
      var self = this;
      if (!(self._squareIsLegal($targetDiv))) { return true };
      if (self._squareIsSelected($targetDiv)) { return true };
      if (self._squareIsLegalAndOccupied($targetDiv)) { return true };
      return false;
    },

    _moveWithoutTake : function($targetDiv) {
      return ( $targetDiv.hasClass("highlight") && !($targetDiv.hasClass("take")) );
    },

    _moveWithTake : function($targetDiv) {
      return ( $targetDiv.hasClass("highlight") && $targetDiv.hasClass("take") );
    },

    _opponentOf : function(player) {
      return (player === "player_1") ? "player_2" : "player_1";
    },

    _sanityCheck : function() {
      var self = this;
      $('.illegal').removeClass('player_1');
      $('.illegal').removeClass('player_2');
      self._clearAllHighlights();
    },

  }; /* end of Checkers.prototype */

  new Checkers();
});
