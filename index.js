const game = (function () {
  "use strict";
  const gameSettings = {
    players: 1,
  };

  const _initializeGame = (function () {
    document.querySelector("#one-player").addEventListener("click", () => {
      gameSettings.players = 1;
      domHandler.hidePlayerCountWindow()
    });
    document.querySelector("#two-player").addEventListener("click", () => {
      gameSettings.players = 2;
    });
  })();

  const playMove = function (event) {
    const currentBoard = gameBoard.view();
    if (event.target.dataset.index) {
      let row = 0;
      let column = event.target.dataset.index;
      switch (event.target.parentElement.parentElement.classList.value) {
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
        gameBoard.update(players.active(), row, column);
        players.updatePlayerState();
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
          continue; // This keeps us from returning a win when there's an empty row
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
        currentBoard[0][0] === currentBoard[1][1] &&
        currentBoard[1][1] === currentBoard[2][2]
      ) {
        winner = currentBoard[0][0];
      }
      // Bottom left to top right check
      if (
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

const playerFactory = (playerName, sign) => {
  return { playerName, sign };
};

const gameBoard = (function () {
  "use strict";
  const _board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  const _boardDom = [];

  const _initializeBoard = (function () {
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

  function view() {
    const boardCopy = _board;

    return boardCopy;
  }

  function viewDom() {
    const domCopy = [_topRowDom, _middleRowDom, _bottomRowDom];
  }

  function _updateDom(player, row, cell) {
    _boardDom[row][cell].textContent = player;
  }

  function update(player, row, cell) {
    _board[row][cell] = player;
    _updateDom(player, row, cell);
  }

  return { view, update, viewDom };
})();

const domHandler = (function () {
  const playerCountWindow = document.querySelector(".player-pick");

  function hidePlayerCountWindow() {
    playerCountWindow.style.setProperty("opacity", "0");
    setTimeout(() => {
      playerCountWindow.style.setProperty("display", "none");
    }, 300);
  }

  return {hidePlayerCountWindow, }
})();

const players = (function () {
  "use strict";
  let _activePlayer = "X";

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

  return { updatePlayerState, active };
})();
