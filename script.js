const board = document.getElementById('chessboard');

const pieces = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

const startPosition =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

let boardState = [];
let selectedPiece = null;
let selectedSquare = null;
let turn = 'white';

let history = [];

function copyBoard(board) {
  return board.map(row => row.slice());
}

function createBoard() {
  board.innerHTML = '';
  boardState = [];
  const rows = startPosition.split('/');

  for (let row = 0; row < 8; row++) {
    boardState[row] = [];
    let colIndex = 0;
    for (let char of rows[row]) {
      if (isNaN(char)) {
        boardState[row][colIndex] = char;
        colIndex++;
      } else {
        let emptyCount = parseInt(char);
        for (let i = 0; i < emptyCount; i++) {
          boardState[row][colIndex] = null;
          colIndex++;
        }
      }
    }
  }

  renderBoard();
}

function renderBoard() {
  board.innerHTML = '';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
      square.dataset.row = row;
      square.dataset.col = col;

      const pieceChar = boardState[row][col];
      if (pieceChar) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.textContent = pieces[pieceChar];
        square.appendChild(piece);
      }

      square.addEventListener('click', () => onSquareClick(row, col));
      board.appendChild(square);
    }
  }

  highlightSelected();
}

function onSquareClick(row, col) {
  const piece = boardState[row][col];

  if (selectedPiece) {
    if (canMove(selectedSquare.row, selectedSquare.col, row, col)) {
      makeMove(selectedSquare.row, selectedSquare.col, row, col);
      selectedPiece = null;
      selectedSquare = null;
      turn = turn === 'white' ? 'black' : 'white';
    } else {
      if (piece && isOwnPiece(piece)) {
        selectedSquare = { row, col };
        selectedPiece = piece;
      } else {
        selectedPiece = null;
        selectedSquare = null;
      }
    }
  } else {
    if (piece && isOwnPiece(piece)) {
      selectedPiece = piece;
      selectedSquare = { row, col };
    }
  }
  renderBoard();
}

function highlightSelected() {
  const squares = document.querySelectorAll('.square');
  squares.forEach(sq => {
    sq.classList.remove('selected');
  });
  if (selectedSquare) {
    const index = selectedSquare.row * 8 + selectedSquare.col;
    squares[index].classList.add('selected');
  }
}

function isOwnPiece(piece) {
  if (turn === 'white') return piece === piece.toUpperCase();
  else return piece === piece.toLowerCase();
}

function canMove(fromRow, fromCol, toRow, toCol) {
  const piece = boardState[fromRow][fromCol];
  if (!piece) return false;

  if (fromRow === toRow && fromCol === toCol) return false;

  const target = boardState[toRow][toCol];
  if (target && isOwnPiece(target)) return false;

  const pieceType = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  switch (pieceType) {
    case 'p':
      return canMovePawn(fromRow, fromCol, toRow, toCol, isWhite);
    case 'r':
      return canMoveRook(fromRow, fromCol, toRow, toCol);
    case 'n':
      return canMoveKnight(rowDiff, colDiff);
    case 'b':
      return canMoveBishop(fromRow, fromCol, toRow, toCol);
    case 'q':
      return canMoveQueen(fromRow, fromCol, toRow, toCol);
    case 'k':
      return canMoveKing(rowDiff, colDiff);
  }

  return false;
}

function canMovePawn(fromRow, fromCol, toRow, toCol, isWhite) {
  const direction = isWhite ? -1 : 1;
  const startRow = isWhite ? 6 : 1;

  const target = boardState[toRow][toCol];
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  if (colDiff === 0 && rowDiff === direction && !target) return true;

  if (
    colDiff === 0 &&
    rowDiff === 2 * direction &&
    fromRow === startRow &&
    !target &&
    !boardState[fromRow + direction][fromCol]
  )
    return true;

  if (
    Math.abs(colDiff) === 1 &&
    rowDiff === direction &&
    target &&
    !isOwnPiece(target)
  )
    return true;

  return false;
}

function canMoveRook(fromRow, fromCol, toRow, toCol) {
  if (fromRow !== toRow && fromCol !== toCol) return false;
  if (!isPathClear(fromRow, fromCol, toRow, toCol)) return false;
  return true;
}

function canMoveKnight(rowDiff, colDiff) {
  return (
    (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
    (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
  );
}

function canMoveBishop(fromRow, fromCol, toRow, toCol) {
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
  if (!isPathClear(fromRow, fromCol, toRow, toCol)) return false;
  return true;
}

function canMoveQueen(fromRow, fromCol, toRow, toCol) {
  if (canMoveRook(fromRow, fromCol, toRow, toCol)) return true;
  if (canMoveBishop(fromRow, fromCol, toRow, toCol)) return true;
  return false;
}

function canMoveKing(rowDiff, colDiff) {
  return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
  let stepRow = Math.sign(toRow - fromRow);
  let stepCol = Math.sign(toCol - fromCol);

  let currentRow = fromRow + stepRow;
  let currentCol = fromCol + stepCol;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (boardState[currentRow][currentCol] !== null) return false;
    currentRow += stepRow;
    currentCol += stepCol;
  }
  return true;
}

function makeMove(fromRow, fromCol, toRow, toCol) {
  history.push({
    board: copyBoard(boardState),
    turn: turn
  });

  boardState[toRow][toCol] = boardState[fromRow][fromCol];
  boardState[fromRow][fromCol] = null;
}

function undoMove() {
  if (history.length === 0) return;
  const lastState = history.pop();
  boardState = lastState.board;
  turn = lastState.turn;
  selectedPiece = null;
  selectedSquare = null;
  renderBoard();
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    undoMove();
  }
});

// Запускаем игру
createBoard();