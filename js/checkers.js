$(document).ready(function() {
  var Checkers = function() {
    this.$body = $('body');

    /* board */
    this.$board = $('#board');

    /* pieces */
    this.$red = $('.red');
    this.$green = $('.green');
    this.$brown = $('.brown');
    this.$orange = $('.orange');

    /* debug divs */
    this.$debugSquareDisplay = $('#debug-display-square');

    this.bindEvents();
  };

  var Square = function(legal, row, column) {
    this.legal = legal;
    this.row = row;
    this.column = column;
    if ((column <= 3) && (legal)) {
      this.player = 1;
    } else if ((column >= 6) && (legal)) {
      this.player = 2;
    };
  };

  Square.prototype = {
    /* todo: all of the square's functions */
  };

  Checkers.prototype = {
    bindEvents: function() {
      var self = this,
          testing = true;

      if (testing) {
        self._toggleBoard("playing");
        self.$board.mousemove(function(evt) {
          self._debug(evt, "display-square");
        });
      };

      self._buildChatRoom();
      /* on keypress maybe inside chat */
      /*
      self._chatListener() {
      }
      */
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
      var self = this,
          rows, cols, squares, legal_space, squares;

      squares = {};
      rows = 8;
      cols = 8;
      legal = false;

      self.$body.toggleClass('playing');

      for (r=1; r<rows+1; r++) {
        self.$board.append('<div id="r' + r + '" class="row"></div>');
        for (c=1; c<cols+1; c++) {
          legal_space = legal ? "legal" : "illegal";
          square_name = "c" + c + "r" + r;
          square = '<div id="' + square_name+'" class="square ' + legal_space + '"></div>';
          $('#r'+r).append(square);
          if ((c <= 3) && (legal)) { self._occupySquare(square_name, 1) };
          if ((c >= 6) && (legal)) { self._occupySquare(square_name, 2) };
          var pieces = {};
          legal = !legal;
        };
        legal = !legal;
      };
      self._move(1);
    },

    _occupySquare : function(square_name, player) {
      $('#'+square_name).toggleClass('occupied player_'+player);
    },

    _getCoords : function(square_name) {
      /* returns a hash with coords[col] & coords[row]*/
      var square = square_name.split("");
      var coords = {};
      coords['col'] = square[1];
      coords['row'] = square[3];
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

    _move : function(player) {
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
      var direction = (player === 1 ) ? 1 : -1;

      $('#move-banner').text('Player ' + player);

      $squares.on("click", function(evt) {
        var target = evt.currentTarget.id

      });

      /* are you done?  yes - end, no? next move
      player === 1 ? self._move(2) : self._move(1);
       */
    },

    _evaluateMoves : function(target) {
/* TODO: up to here - basically make this and the "_move" function into one, there is a lot of redundancy here.  then _evaluateMoves.  should be a functoin with only one parameter, the square you are checking.  the recursion of it goes above in the "move" */
      var moves = {};

      if ($target.hasClass("occupied player_"+player)) {
        $target.toggleClass('highlight');
      };
      next = "c" + (squares[square_id].column + direction) + "r" + (squares[square_id].row + 1)
      next = "c" + (squares[square_id].column + direction) + "r" + (squares[square_id].row - 1)
    },

    _buildChatRoom : function() {
      console.log("...building chat room");

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



