$(document).ready(function() {
  var Checkers = function() {
    var self = this;
    self.$body = $('body');
    self.$board = $('#board');

    /* debug divs */
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

          if ((c <= 3) && (legal)) {
            self._occupySquare(square_name, 1);
            pieces[square_name] = new Piece(1);
          } else if ((c >= 6) && (legal)) {
            self._occupySquare(square_name, 2);
            pieces[square_name] = new Piece(2);
          };
          legal = !legal;
        };
        legal = !legal;
      };
      self._move(pieces, 1);
    },

    _occupySquare : function(square_name, player) {
      $('#'+square_name).toggleClass('occupied player_'+player);
    },

    _getCoords : function(square_name) {
      var coords = {};
      coords['col'] = parseInt(square_name.split("")[1]);
      coords['row'] = parseInt(square_name.split("")[3]);
      return coords;
    },

    _movePiece : function(pieces, from, to) {
       /* will have pieces, and will have boards.  board is easy, just toggle the class, pieces have to change the name of the hash key */

      $('#'+from).toggleClass(/* whatever necessary classes */)
      $('#'+to).toggleClass(/* whatever necessary classes */) /* maybe do an add to the function above? */
      pieces[to] = pieces[from];
      delete pieces[from];
    },

    _positionPiece : function(square, player) {
      $('#'+square).toggleClass('occupied player_'+player);
    },

    _move : function(pieces, player) {
              /*
               * example data:
               * =============
               * player = 1
               * squares = all of the playable squares on the board
               *
               * needs
               *
               * btw: score = count of self occupied squares + 1
               */

      var self = this;
      var $squares = $('.square');
      var directionColumn = (player === 1 ) ? 1 : -1;
      /* get rid of these directions, send the player number, get the direction from the player number, and multiply the row and col paths using the depth counter */
      var directionRowPath1 = -1;
      var directionRowPath2 = 1;
/*
      self._clearAllHighlights()
      don't clear the highlights here, how will the square click know that there is a potential move  */
      /* currently highlighting possible moves, next time, only highlight possible move chips */

      $('#move-banner').text('Player ' + player);

      $squares.on("click", function(evt) {
        var $squareClicked = $("#"+evt.currentTarget.id);
        /*
      self._clearAllHighlights()
      don't clear the highlights here, how will the square click know that there is a potential move  */
      /* currently highlighting possible moves, next time, only highlight possible move chips */

        if ( self._squareIsActive($squareClicked) ) {
          self._initiateMove( $squareClicked )
        };

        if ( self._squareIsOccupiedBySelf($squareClicked, player) ) {
          var availableMoves = [];
          var currentCoords = self._getCoords(evt.currentTarget.id);

          self._clearAllHighlights()
          availableMoves.push(self._evaluateNextMove(currentCoords, directionColumn, directionRowPath1, 1, player));
          availableMoves.push(self._evaluateNextMove(currentCoords, directionColumn, directionRowPath2, 1, player));
          self._highlightAvailableMoves(availableMoves) ? $squareClicked.addClass('active') : "";
        };


          /*
        if ( self._squareIsUnplayable) {
          self._clearAllHighlights()
        };
NEEDS WORK
          */
      });
      /* are you done?  yes - end, no? next move
      player === 1 ? self._move(2) : self._move(1);
       */
    },

    _highlightAvailableMoves : function(moves) {
      var eval = false;
      for (var move = 0; move < moves.length; move++) {
        if (moves[move] !== false) {
          eval = true;
          $('#'+moves[move]).addClass('highlight')
        };
      };
      return eval;
    },

    _clearAllHighlights : function() {
      $('.square').removeClass('highlight');
    },

    _evaluateNextMove : function(currentCoords, directionColumn, directionRow, depth, player) {
      var self = this;
      var targetCol = currentCoords['col'] + directionColumn;
      var targetRow = currentCoords['row'] + directionRow;
      var targetSquare = "c"+ targetCol + "r" + targetRow;

      if (self._squareIsFreeAndLegal($('#'+targetSquare))) {
        return targetSquare;
      };
      /* depth counter is how far deep you want to see ahead -- use this for multiple moves */
      if ((self._squareIsOccupiedByOpponent($('#'+targetSquare), player)) && (depth < 3)) {
        self._evaluateNextMove(targetSquare, (directionColumn*2), (directionRow*2), depth+1, player);
      };
      return false;
    },

    _squareIsFreeAndLegal : function($targetDiv) {
      return ($targetDiv.hasClass("legal") && !($targetDiv.hasClass("occupied")))
    },

    _squareIsActive : function($targetDiv) {
      return ($targetDiv.hasClass("active"));
    },

    _squareIsFree : function($targetDiv) {
      return ( ($targetDiv.hasClass("legal")) && !($targetDiv.hasClass("occupied")) );
    },

    _squareIsOccupiedBySelf : function($targetDiv, player) {
      return ($targetDiv.hasClass("player_"+player));
    },

    _squareIsOccupiedByOpponent : function($targetDiv, player) {
      return ($targetDiv.hasClass("player_"+player))
    },

    _squareIsLegal : function($targetDiv) {
      return ($targetDiv.hasClass("legal"));
    },

    _squareIsUnplayable : function($targetDiv, player) {
      if (self._squareIsActive($targetDiv)) { return true };
      if ($targetDiv.hasClass("occupied")) { return true };
      if (!self._squareIsLegal($targetDiv)) { return true };
      return false;
    },

  }; /* end of Checkers.prototype */

  new Checkers();
});



/* FLOW:
 * =====
 * Player will go to the intro screen
 * enter their name
 * create or join a room
 * select number of players
 * create room: choose size of the board
 * after the room is ready: toggle to board
 * create board
 * offer first person the move
 * check for valid moves
 * move
 * send move data to room
 * wait for second person to move
 * check if there's a king after each move
 * check if the game is over for each move?
 *
 * CHAT ROOM
 *
 */



