const domHandler = (function () {
  const playerCountWindowEl = document.querySelector(".player-pick");
  const gameboardEl = document.querySelector(".board-wrapper");
  const nameEntryEl = document.querySelector(".player-name");
  const winnerEl = document.querySelector(".winner-screen");
  let _lastWinner = "none";

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
        document.querySelectorAll(".one-player").forEach((element) => {
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

  const winnerScreen = (function () {
    function hide() {
      _hide(winnerEl);
    }

    function show() {
      if (_lastWinner === "tie") {
        winnerEl.querySelector("h3").innerText = `It's a tie!`;
      } else {
        winnerEl.querySelector("h3").innerText = `${_lastWinner} wins!`;
      }
      winnerEl
        .querySelector("button")
        .addEventListener("click", function playAgainEvent() {
          winnerEl
            .querySelector("button")
            .removeEventListener("click", playAgainEvent);
          players.clear();
          domHandler.winnerScreen.hide();
          setTimeout(domHandler.playerCountWindow.show, 500);
        });
      _show(winnerEl);
    }
    return { hide, show };
  })();

  function setLastWinner(lastWinner) {
    _lastWinner = lastWinner;
  }

  return {
    playerCountWindow,
    gameBoard,
    nameEntry,
    winnerScreen,
    setLastWinner,
  };
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

  function clear() {
    players = [];
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
      console.log("It's a tie!");
      return "tie";
    }
    if (!players.filter((item) => item.sign === winnerSign)) {
      return;
    }
    let winnerName = players.filter((item) => item.sign === winnerSign);
    console.log(`${winnerName[0].playerName} wins!`);
    return winnerName[0].playerName;
  }

  return { updatePlayerState, active, creator, list, getWinnerName, clear };
})();

const game = (function () {
  "use strict";
  const gameSettings = {
    players: 1,
    gameOver: false,
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
    document.querySelector("#p2form").addEventListener("submit", (event) => {
      event.preventDefault();
      players.creator(event.target.querySelector("#p2p1name").value);
      players.creator(event.target.querySelector("#p2name").value);
      event.target.reset();
      domHandler.nameEntry.hide();
      setTimeout(domHandler.gameBoard.show, 500);
    });
    domHandler.playerCountWindow.show();
  })();

  function playerCount() {
    return gameSettings.players;
  }

  function computerMove() {
    if (gameSettings.players === 1 && players.active() === "O") {
      const generatedMove = gameBoard.getRandomSpace();
      gameBoard.update(players.active(), generatedMove[0], generatedMove[1]);
      players.updatePlayerState();
    }
  }

  function playMove(event) {
    if (gameSettings.gameOver) {
      // Keeps the players' signs from flipping if the game is replayed
      players.updatePlayerState();
      gameSettings.gameOver = false;
    }

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
          _declareWinner(checkWinner);
        } else {
          computerMove();
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

  function _declareWinner(checkWinner) {
    domHandler.gameBoard.hide();
    gameSettings.gameOver = true;
    gameBoard.disable();
    let newLastWinner = players.getWinnerName(checkWinner);
    domHandler.setLastWinner(newLastWinner);
    gameBoard.enable();
    setTimeout(domHandler.winnerScreen.show, 500);
    setTimeout(gameBoard.clear, 300);
  }

  function isOver() {
    return gameSettings.gameOver;
  }

  return { playMove, checkWinner, playerCount, computerMove };
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

  function getRandomSpace() {
    const emptyCells = [];
    _board.forEach((value, index) => {
      _board[index].forEach((value, index2) => {
        if (value === null) {
          emptyCells.push([index, index2]);
        }
      });
    });
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  const initialize = (function () {
    enable();
  })();

  return { view, update, viewDom, disable, clear, enable, getRandomSpace };
})();
