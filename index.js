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
      if (game.playerCount() === 2) {
        console.log(game.playerCount());
        document.querySelectorAll(".one-player").forEach((element) => {
          console.log(element);
          element.style.setProperty("display", "none");
        });
        document.querySelectorAll(".two-player").forEach((element) => {
          element.style.setProperty("display", "flex");
        });
      }
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

  function list() {
    return players;
  }

  function getWinnerName(winnerSign) {
    if (winnerSign === "tie") {
      return "tie";
    }
    let winnerName = players.filter((item) => item.sign === winnerSign);
    console.log(`${winnerName[0].playerName} wins!`);
    return winnerName[0].playerName;
  }

  return { updatePlayerState, active, creator, list, getWinnerName };
})();

const game = (function () {
  "use strict";
  const gameSettings = {
    players: 1,
  };

  const initializeGame = (function () {
    // Handles the initial windows at the start of the game
    document.querySelector("#one-player").addEventListener("click", () => {
      gameSettings.players = 1;
      domHandler.playerCountWindow.hide();
      setTimeout(domHandler.nameEntry.show, 500);
    });
    document.querySelector("#two-player").addEventListener("click", () => {
      gameSettings.players = 2;
      domHandler.playerCountWindow.hide();
      setTimeout(domHandler.nameEntry.show, 500);
    });
    document.querySelector("#p1form").addEventListener("submit", (event) => {
      event.preventDefault();
      players.creator(event.target.querySelector("#p1name").value);
      players.creator("Computer");
      event.target.reset();
      domHandler.nameEntry.hide();
      setTimeout(domHandler.gameBoard.show, 500);
    });
    domHandler.playerCountWindow.show();
  })();

  function playerCount() {
    return gameSettings.players;
  }

  function playMove(event) {
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
        let checkWinner = game.checkWinner();
        if (
          checkWinner === "tie" ||
          checkWinner === "X" ||
          checkWinner === "O"
        ) {
          gameBoard.disable();
          players.getWinnerName(checkWinner);
        }
      }
    }
  }

  function checkWinner() {
    const currentBoard = gameBoard.view(); // Get the current board state
    let winner = "none";
    let nullCount = 0;

    // Vertical Row Check
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 2; j++) {
        if (currentBoard[i][j] === null) {
          nullCount++; // Checks for empty board spaces
        }
      }
      if (currentBoard[0][i] === null) {
        continue; // This keeps us from returning a win when there's an empty row
      }
      if (
        currentBoard[0][i] === currentBoard[1][i] &&
        currentBoard[1][i] === currentBoard[2][i]
      ) {
        winner = currentBoard[0][i];
      }
    }

    // Horizontal row check
    for (const row of currentBoard) {
      if (row[0] === null) {
        nullCount++;
        continue;
      }
      if (row[0] === row[1] && row[1] === row[2]) {
        winner = row[0];
        console.log(winner);
      }
    }

    // Top left to bottom right check
    if (
      currentBoard[0][0] != null &&
      currentBoard[0][0] === currentBoard[1][1] &&
      currentBoard[0][0] === currentBoard[2][2]
    ) {
      winner = currentBoard[0][0];
    }
    // Bottom left to top right check
    if (
      currentBoard[2][0] != null &&
      currentBoard[2][0] === currentBoard[1][1] &&
      currentBoard[2][0] === currentBoard[0][2]
    ) {
      winner = currentBoard[0][2];
    }

    if (winner === "none" && nullCount === 0) {
      return "tie";
    } else {
      return winner;
    }
  }

  return { playMove, checkWinner, playerCount };
})();

const gameBoard = (function () {
  "use strict";
  const _board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  const _boardDom = [];

  function enable() {
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
  }

  function disable() {
    //removes event listeners set by _initialize
    _boardDom.forEach((currentValue) => {
      currentValue.forEach((newCurrentValue, newCurrentIndex) => {
        newCurrentValue.dataset.index = newCurrentIndex;
        removeEventListener("click", game.playMove);
      });
    });
  }

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

  function clear() {
    for (let i = 0; i < _board[0].length; i++) {
      for (let j = 0; j < _board[0].length; j++) {
        _board[i][j] = null;
        _updateDom(null, i, j);
      }
    }
  }

  const initialize = (function () {
    enable();
  })();

  return { view, update, viewDom, disable, clear, enable };
})();
