$(document).ready(function() {
  var Checkers = function() {
    var self = this;
    self.$body = $('body');
    self.$board = $('#board');
    self.$debugSquareDisplay = $('#debug-display-square');

    self.bindEvents();
  };

  var Piece = function(player) {
    this.player = player;
  };

  Piece.prototype = {
    /* todo: all of the square's functions */
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

      self.$body.toggleClass('playing');

      for (r=1; r<rows+1; r++) {
        self.$board.append('<div id="r' + r + '" class="row"></div>');
        for (c=1; c<cols+1; c++) {
          legal_space = legal ? "legal" : "illegal";
          square_name = "c" + c + "r" + r;
          square = '<div id="' + square_name+'" class="square ' + legal_space + '"></div>';
          $('#r'+r).append(square);
          $('#'+square_name).data( "coords", { row: r, col: c } );

          if ((c <= 3) && (legal)) {
            self._toggleOccupiedSquare(square_name, "player_1");
            pieces[square_name] = new Piece("player_1");
          } else if ((c >= 6) && (legal)) {
            self._toggleOccupiedSquare(square_name, "player_2");
            pieces[square_name] = new Piece("player_2");
          };
          legal = !legal;
        };
        legal = !legal;
      };
      self._move(pieces, "player_1");
    },

    _toggleOccupiedSquare : function(square_name, player) {
      $('#'+square_name).toggleClass(player);
    },

    _toggleSelectedSquare : function($square) {
      $square.toggleClass('selected');
    },

    /* rename _move into like _game or something */
    _move : function(pieces, player) {
      var self = this;
      var $squares = $('.square');
      $('#move-banner').text('Player ' + player);

      $squares.on("click", function(evt) {
        if ($('.selected').length !== 0) {
          var $previousSelected = self._constructId($('.selected')[0].id);
          self._toggleSelectedSquare($previousSelected);
        };

        var $squareClicked = self._constructId(evt.currentTarget.id);
        self._toggleSelectedSquare($squareClicked);

        if ( self._squareIsOccupiedBySelf($squareClicked, player) && !(self._squareIsLegalMove( $squareClicked )) ) {
          var availableMoves = [];

          availableMoves.push(self._evaluateNextMove($squareClicked, "rowPath_1", 1, player));
          availableMoves.push(self._evaluateNextMove($squareClicked, "rowPath_2", 1, player));
          self._highlightAvailableMoves(availableMoves);
        };

        if ( self._moveWithoutTake($squareClicked) ) {
          self._moveSquare( $squareClicked, $previousSelected, player, { take: false } );
          player = (player === "player_1") ? "player_2" : "player_1";
        };

        if ( self._moveWithTake($squareClicked, $previousSelected, player) ) {
          self._moveSquare( $squareClicked, $previousSelected, player, { take: true } );
          player = (player === "player_1") ? "player_2" : "player_1";
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
      self._clearAllHighlights();
      $prevDiv.toggleClass(player);
      $targetDiv.toggleClass(player);
      if (options.take) {
        data = $targetDiv.data();
        $div = $("#"+data.take);
        $div.toggleClass(self._opponentOf(player));
      };
    },

    /* TODO: note that this algorithm is not taking into account king'd pieces */
    _evaluateNextMove : function($square, rowPath, depth, player) {
      if (depth < 3) {
        var self = this;
        var directionColumn = (player === "player_1" ) ? 1 : -1;
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
          self._movementHasTake($targetSquare, $jumpSquare);
          return $targetSquare;
        };

        if (self._squareIsOccupiedByOpponentUnderMaxDepth($targetSquare, player, depth, 3)) {
          depth = depth + 1;
          return this._evaluateNextMove($square, rowPath, depth, player);
        };

        return false;
      };
    },

    _movementHasTake : function($newSquare, $jumpedSquare) {
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

  }; /* end of Checkers.prototype */

  new Checkers();
});
