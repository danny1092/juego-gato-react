/*
1.- Solo para el movimiento actual, muestra “Estás en el movimiento #…” en lugar de un botón
2.- Vuelve a escribir Board para usar dos bucles para crear los cuadrados en lugar de codificarlos.
3.- Agrega un botón de alternancia que te permita ordenar los movimientos en orden ascendente o descendente.
4.- Cuando alguien gane, resalta los tres cuadrados que causaron la victoria (y cuando nadie gane, muestra un mensaje indicando que el resultado fue un empate).
5.-Muestra la ubicación de cada movimiento en el formato (columna, fila) en la lista del historial de movimientos.
*/

import { useState } from 'react';

// 🟡 Punto 4: Resaltado de la línea ganadora
function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: highlight ? '#ff0' : 'white' }} // 🔸 Fondo amarillo si está en la línea ganadora
    >
      {value}
    </button>
  );
}

// 🟡 Punto 2: Reescritura del Board con bucles
function Board({ xIsNext, squares, onPlay, winningLine }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares).winner) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const winnerData = calculateWinner(squares);
  const winner = winnerData.winner;

  let status;
  if (winner) {
    status = "Ganador: " + winner;
  } else if (!squares.includes(null)) {
    // 🔹 Punto 4: Mostrar empate
    status = "¡Empate!";
  } else {
    status = "Siguiente jugador: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {
        // 🔹 Usamos dos bucles para crear el tablero (filas x columnas)
        [0, 1, 2].map(row => (
          <div className="board-row" key={row}>
            {[0, 1, 2].map(col => {
              const index = row * 3 + col;
              const isWinning = winningLine?.includes(index); // 🔸 Verificamos si el cuadrado forma parte de la línea ganadora
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onSquareClick={() => handleClick(index)}
                  highlight={isWinning}
                />
              );
            })}
          </div>
        ))
      }
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), lastMove: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascending, setAscending] = useState(true); // 🔹 Punto 3: Estado para controlar orden de movimientos

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  // 🔹 Punto 5: Almacenamos el índice del último movimiento
  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, lastMove: moveIndex }
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // 🔹 Punto 5: Ubicaciones por movimiento
  const moves = history.map((step, move) => {
    const moveIndex = step.lastMove;
    let description;

    if (move === currentMove) {
      // 🔹 Punto 1: Indicar movimiento actual
      description = `Estás en el movimiento #${move}`;
    } else {
      if (move > 0 && moveIndex !== null) {
        const row = Math.floor(moveIndex / 3) + 1;
        const col = (moveIndex % 3) + 1;
        description = `Ir al movimiento #${move} (${col}, ${row})`;
      } else {
        description = "Ir al inicio del juego";
      }
    }

    return (
      <li key={move}>
        {
          move === currentMove
            ? <span>{description}</span> // 🔸 Punto 1: No usar botón para el movimiento actual
            : <button onClick={() => jumpTo(move)}>{description}</button>
        }
      </li>
    );
  });

  const winnerData = calculateWinner(currentSquares);

  // 🔹 Punto 3: Alternar orden ascendente/descendente
  const sortedMoves = ascending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningLine={winnerData.line}
        />
      </div>
      <div className="game-info">
        <button onClick={() => setAscending(!ascending)}>
          Orden {ascending ? "descendente" : "ascendente"}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

// 🔹 Punto 4: Se modifica esta función para devolver también la línea ganadora
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }; // 🔸 Retorna también la línea
    }
  }
  return { winner: null, line: null };
}
