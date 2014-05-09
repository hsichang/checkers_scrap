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
/*
      if (squares[target].legal && action === "display-square") {
        self.$debugSquareDisplay.text("#"+target);
      };
      */
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

          squares[square_name] = new Square(legal, r, c);
          if (squares[square_name].player === 1) { self._positionPiece(square_name, 1) };
          if (squares[square_name].player === 2) { self._positionPiece(square_name, 2) };
          legal = !legal

      /* todo:
       * maybe build a hash table here
       * the hash table could have an array
       * of info about the square
       * does it have a legal move?
       * does it have a chip
       * can it be activated?
       * etc
       *
       * i.e.,
       * Hash[:space(/r2c4/)][:legal] => true
       *                     [:chip] => green
       *                     [:chip] => null
       *                     [:legal] => [r3c3,r3c3]
       *                     [:etc] => etc;
       */

        };
        legal = !legal
      };

      self._move(squares, 1);
    },

    _positionPiece : function(square, player) {
      $('#'+square).toggleClass('occupied player_'+player);
    },

    _move : function(squares, player) {
      var self = this;
      var $squares = $('.square');

      $('#move-banner').text('Player ' + player);

      $squares.on("click", function(evt) {
        self._evaluateMoves(squares, player, evt.currentTarget.id);
      });
    },

    _evaluateMoves : function(squares, player, square_id) {
/* TODO: up to here - basically make this and the "_move" function into one, there is a lot of redundancy here.  then _evaluateMoves.  should be a functoin with only one parameter, the square you are checking.  the recursion of it goes above in the "move" */
      var moves = {};
      var $target = $('#'+square_id);
      if (player === 1) { direction = 1 } else { direction = -1 };
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



