const domHandler = (function () {
  const playerCountWindowEl = document.querySelector(".player-pick");
  const gameboardEl = document.querySelector(".board-wrapper");
  const nameEntryEl = document.querySelector(".player-name");

  function _hide(element) {
    element.style.setProperty("opacity", "0");
    setTimeout(() => {
      element.style.setProperty("display", "none");
    }, 300);
  }

  function _show(element) {
    element.style.setProperty("opacity", "0");
    element.style.setProperty("display", "flex");
    setTimeout(() => {
      element.style.setProperty("opacity", "1");
    }, 300);
  }

  const playerCountWindow = (function () {
    function hide() {
      _hide(playerCountWindowEl);
    }

    function show() {
      _show(playerCountWindowEl);
    }
    return { hide, show };
  })();

  const nameEntry = (function () {
    function hide() {
      _hide(nameEntryEl);
    }

    function show() {
      _show(nameEntryEl);
    }

    return { hide, show };
  })();

  const gameBoard = (function () {
    function hide() {
      _hide(gameboardEl);
    }

    function show() {
     _show(gameboardEl);
    }
    return { hide, show };
  })();

  return { playerCountWindow, gameBoard, nameEntry };
})();

const game = (function () {
  "use strict";
  const gameSettings = {
    players: 1,
  };

  const _initializeGame = (function () {
    // Handles the initial windows at the start of the game
    document.querySelector("#one-player").addEventListener("click", () => {
      gameSettings.players = 1;
      domHandler.playerCountWindow.hide();
      setTimeout(domHandler.nameEntry.show, 500);
    });
    document.querySelector("#two-player").addEventListener("click", () => {
      gameSettings.players = 2;
    });
    document.querySelector("input[type=submit]").addEventListener("submit", (event) => {
        event.preventDefault();
        console.log(event.target);
    })
    domHandler.playerCountWindow.show();
  })();

  const playMove = function (event) {
    const currentBoard = gameBoard.view();
    if (event.target.dataset.index) {
      // Checks to see if user clocked on a valid area
      let row = 0;
      let column = event.target.dataset.index;
      switch (
        event.target.parentElement.parentElement.classList.value // Pulls information about which row the target click was on
      ) {
        case "top-row":
          row = 0;
          break;
        case "middle-row":
          row = 1;
          break;
        case "bottom-row":
          row = 2;
          break;
      }
      if (currentBoard[row][column] === null) {
        // This ensures we're only playing on empty squares
        gameBoard.update(players.active(), row, column);
        players.updatePlayerState();
        if (
          game.checkWinner === "tie" ||
          game.checkWinner() === "X" ||
          game.checkWinner() === "O"
        ) {
          console.log("Winner!");
          console.log(game.checkWinner());
          gameBoard.disable();
        }
      }
    }
  };

  const checkWinner = function () {
    const currentBoard = gameBoard.view(); // Get the current board state
    let winner = "none";
    let nullCount = 0;

    const _horizontalRowCheck = (function () {
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i][0] === null) {
          nullCount++;
          continue; // Ensures we aren't returning a win when there's an empty row
        }
        if (
          currentBoard[i][0] === currentBoard[i][1] &&
          currentBoard[i][1] === currentBoard[i][2]
        ) {
          winner = currentBoard[i][0];
        }
      }
    })();

    const _veritcalRowCheck = (function () {
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[0][i] === null) {
          nullCount++;
          continue; // This keeps us from returning a win when there's an empty row
        }
        if (
          currentBoard[0][i] === currentBoard[1][i] &&
          currentBoard[1][i] === currentBoard[2][i]
        ) {
          winner = currentBoard[0][i];
        }
      }
    })();

    const _diagonalRowCheck = (function () {
      // Top left to bottom right check
      if (
        currentBoard[0][0] != null &&
        currentBoard[0][0] === currentBoard[1][1] &&
        currentBoard[1][1] === currentBoard[2][2]
      ) {
        winner = currentBoard[0][0];
      }
      // Bottom left to top right check
      if (
        currentBoard[0][2] != null &&
        currentBoard[0][2] === currentBoard[1][1] &&
        currentBoard[1][1] === currentBoard[2][0]
      ) {
        winner = currentBoard[0][2];
      }
    })();

    if (winner === "none" && nullCount === 0) {
      return "tie";
    } else return winner;
  };

  return { playMove, checkWinner };
})();

const gameBoard = (function () {
  "use strict";
  const _board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  const _boardDom = [];

  const _initialize = (function () {
    // Assign table elements to variables and add event listeners
    _boardDom[0] = document.querySelectorAll(".top-row > td > div");
    _boardDom[1] = document.querySelectorAll(".middle-row > td > div");
    _boardDom[2] = document.querySelectorAll(".bottom-row > td > div");
    _boardDom.forEach((currentValue) => {
      currentValue.forEach((newCurrentValue, newCurrentIndex) => {
        newCurrentValue.dataset.index = newCurrentIndex;
        addEventListener("click", game.playMove);
      });
    });
  })();

  const disable = function () {
    //removes event listeners set by _initialize
    _boardDom.forEach((currentValue) => {
      currentValue.forEach((newCurrentValue, newCurrentIndex) => {
        newCurrentValue.dataset.index = newCurrentIndex;
        removeEventListener("click", game.playMove);
      });
    });
  };

  function view() {
    const boardCopy = _board;

    return boardCopy;
  }

  function viewDom() {
    // returns a copy of the DOM array
    const domCopy = [_topRowDom, _middleRowDom, _bottomRowDom];
  }

  function _updateDom(player, row, cell) {
    _boardDom[row][cell].textContent = player;
  }

  function update(player, row, cell) {
    _board[row][cell] = player;
    _updateDom(player, row, cell);
  }

  return { view, update, viewDom, disable };
})();

const players = (function () {
  "use strict";
  let _activePlayer = "X";
  let players = [];

  function updatePlayerState() {
    if (_activePlayer === "X") {
      _activePlayer = "O";
    } else {
      _activePlayer = "X";
    }
  }

  function active() {
    const activePlayer = _activePlayer;
    return activePlayer;
  }

  const creator = (inputName) => {
    let playerName = inputName;
    let sign = active();
    updatePlayerState();
    players.push({ playerName, sign });
    return { playerName, sign };
  };

  const list = () => players;

  const getWinnerName = () => {
    let winner = players.filter((item) => item.sign === game.checkWinner());
    console.log(winner);
    return winner[0].playerName;
  };

  return { updatePlayerState, active, creator, list, getWinnerName };
})();
