$(document).ready(function() {
  var Checkers = function() {
    var self = this;
    self.$body = $('body');
    self.$board = $('#board');
    self.$player_1_move = $('#move_player_1');
    self.$player_2_move = $('#move_player_2');
    self.$debugSquareDisplay = $('#debug-display-square');

    self.bindEvents();

    /* this time we will be building an object Board, which is a hash
     * that contains "squares".
     *
     * Each "square" holds a single variable.  square(square_name);
     *
     * square(square_name) is an object
     *
     *
     *
     */

  };

  /* Piece may be deprecated */
  var Piece = function(player) {
    this.player = player;
  };

  function Square(name) {
    /* modify function: if you update a square it should check if sane, */
    var self = this;
    self.name = name;
  }

  Square.prototype = {
    _getName: function() {
      var self = this;
      return self.name;
    },

    _sane: function() {
      var self = this;
      if (!self.occupied && self.selected) {
        alert(self.name + 'is insane.  Cannot be occupied and selected');
      };
    },

    _occupy: function() {
      var self = this;
      self.occupy = true;
      self._sane(); // sanity check
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
          console.log(" ")
          console.log(" ")
        };
      };
    },

    _toggleBoard: function(state) {
      var self = this;
      if (state === "playing") { self._buildGameBoard() };
    },

    _buildGameBoard: function() {
      var self = this;
      var pieces = {};
      var rows = 8;
      var cols = 8;
      var legal = false;
      var pieceCounter = 0;

      var board = {};

      self.$body.toggleClass('playing');
      for (r=1; r<rows+1; r++) {
        self.$board.append('<div id="r' + r + '" class="row"></div>');
        for (c=1; c<cols+1; c++) {
          legal_space = legal ? "legal" : "illegal";
          square_name = "c" + c + "r" + r;

          board[square_name] = new Square(square_name);

          square = '<div id="' + square_name+'" class="square ' + legal_space + '"></div>'; /* MUST separate view from this */

          $('#r'+r).append(square);
          $('#'+square_name).data( "coords", { row: r, col: c } );

          if ((c <= 3) && (legal)) {
            self._toggleOccupiedSquare(square_name, "player_1");
            pieces[pieceCounter] = new Piece("player_1");
            pieceCounter++
          } else if ((c >= 6) && (legal)) {
            self._toggleOccupiedSquare(square_name, "player_2");
            pieces[pieceCounter++] = new Piece("player_2");
          };
          legal = !legal;
        };
        legal = !legal;
      };

      self._game(pieces, "player_1");

  /* =======================================
   *
   * SANITY CHECK : This is the board
   *
   * ======================================= */

      console.log('Board: ');
      console.log(board);
      for (var square in board) {
        if (board.hasOwnProperty(square)) {
          console.log(board[square]._getName());
        };
      };
  /* ======================================= */

    },

    _toggleOccupiedSquare : function(square_name, player) {
      $('#'+square_name).toggleClass(player);
    },

    _toggleSelectedSquare : function($square) {
      $square.toggleClass('selected');
    },

    _game : function(pieces, player) {
      var self = this;
      var $squares = $('.square');

      $squares.on("click", function(evt) {
        if ($('.selected').length !== 0) {
          var $previousSelected = self._constructId($('.selected')[0].id);
          self._toggleSelectedSquare($previousSelected);
        };

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

      });
    },

    _highlightAvailableMoves : function(moves) {
      for (var move = 0; move < moves.length; move++) {
        if (moves[move] !== false) {
          moves[move].addClass('highlight')
        };
      };
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
    _evaluateNextMove : function($square, rowPath, depth, player) {
      if (depth < 3) {
        var self = this;
        /* to take king into consideration make a func like:
         * directionColumn = leftOrRight($square, player);
         * if player is 1 and not king || player 2 and king = +1
         * else -1
         * */
        var directionColumn = (player === "player_1") ? 1 : -1;
        var directionRow = (rowPath === "rowPath_1") ? 1 : -1;
        var coords = $square.data("coords");
        var targetCol = coords['col'] + (directionColumn * depth);
        var targetRow = coords['row'] + (directionRow * depth);
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
