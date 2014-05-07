$(document).ready(function() {
  var Checkers = function() {
    this.$variable = $('#game');

    /* page states */
    this.$frontPageContainer = $('#main');
    this.$boardContainer = $('#board-container');

    /* board */
    this.$board = $('#board');
    this.$squares = $('.square');

    /* pieces */
    this.$red = $('.red');
    this.$green = $('.green');
    this.$brown = $('.brown');
    this.$orange = $('.orange');
    /* todo ==> add the king images */

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
        self._toggleBoard("gameboard");
        self.$board.mousemove(function(evt) {
          self._debug(evt, "display-square");
        });
      };

      $(document).click(function(evt) {
        self._targetClickListener(evt);
      });

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

      if (squares[target].legal && action === "display-square") {
        self.$debugSquareDisplay.text("#"+target);
      };
    },

    _targetClickListener: function(evt) {
      var self = this,
          target = evt.target.id,
          $targetDiv = $('#' + target);

      if (squares[target].legal) {
        $targetDiv.toggleClass('highlight');
      };
    },

    _toggleBoard: function(state) {
      /* TODO: make this evt based
       *
       * if the evt is a start game -> create board
       * if the evt is a win game -> show leaderboard
       *
       */

      var self = this;

      if ( state === "gameboard") {
        self.$frontPageContainer.toggleClass('inactive');
        self.$boardContainer.toggleClass('active');
        squares = self._buildGameBoard(2); /* 2 or 4 players */
      };
    },

    _buildGameBoard: function(players) {
      var self = this,
          rows, cols, square, legal_space, squares;

      squares = {};
      if (players === 2) {
        rows = 8;
        cols = 8;

        legal = false;
        for (r=1; r<rows+1; r++) {
          self.$board.append('<div id="r' + r + '" class="row"></div>');
          for (c=1; c<cols+1; c++) {
            legal_space = legal ? "legal" : "illegal";
            square_name = "r" + r + "c" + c;
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

        return squares;
      };
    },

    _positionPiece: function(square, player) {
      $('#'+square).toggleClass('occupied');
      $('#'+square).toggleClass('piece_player_'+player);
    },

    _buildChatRoom: function() {
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



