import React, { useEffect, useState } from "react";
import "./Board.css";
import { randomIntFromInterval, useInterval } from "../lib/utils";

const BOARD_ROW = 25;
const BOARD_COL = 40;
// let speed = 200;

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    // this value is object for us
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT",
};

const getStartingSnakeValue = (board) => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = board[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

export default function Board() {
  const [speed,setSpeed] = useState(200);
  const [play, setPlay] = useState(false);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createBoard(BOARD_ROW, BOARD_COL));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeValue(board))
  );
  // console.log(snake);
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell])
  );
  const [direction, setDirection] = useState();
  const [food, setFood] = useState(snake.head.value.cell + 5);
  const [pointsAudio] = useState(new Audio("./assets/points.mp3"));
  const [gameOverAudio] = useState(new Audio("./assets/gameover.mp3"));
  const [moveAudio] = useState(new Audio("./assets/move.mp3"));

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      handleKeyDown(event);
    });
  }, []);

  // useInterval(() => {
  //   if (play) moveSnake();
  // }, speed);

  const callback = () => {
    if (play) {
      moveSnake();
    }
  };
  useInterval(callback, speed);

  const playSound = (sound) => {
    sound.currentTime = 0;
    sound.play();
  };

  const handleKeyDown = (event) => {
    const newDirection = getDirectionFromKey(event.key);
    if (newDirection === "") return;
    playSound(moveAudio);
    setPlay(true);
    setDirection(newDirection);
  };

  const moveSnake = () => {
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    // console.log(nextHeadCoords);
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver();
      return;
    }

    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];

    if (snakeCells.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });

    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.add(nextHeadCell);
    // newSnakeCells.delete(snake.tail.value.cell);

    // snake.tail = snake.tail.next;
    // if (snake.tail.next === null) snake.tail = snake.head;

    // const foodConsumed = food === nextHeadCell;
    // if (foodConsumed) {
    //   handleFoodConsumption(newSnakeCells);
    //   newSnakeCells.add(food);
    // } else {
    // //   newSnakeCells.delete(snake.tail.value.cell);
    // }

    const foodConsumed = food === nextHeadCell;
    if (!foodConsumed) {
      newSnakeCells.delete(snake.tail.value.cell); // Remove the tail cell if food wasn't consumed
      snake.tail = snake.tail.next;
      if (snake.tail === null) snake.tail = snake.head;
    } else {
      playSound(pointsAudio);
      // If food was consumed, generate new food position
      handleFoodConsumption(newSnakeCells);
      newSnakeCells.add(food);
    }

    setSnakeCells(newSnakeCells);

    // Apply the transform style to each snake cell
    // const snakeCellElements = document.querySelectorAll(".snake");
    // snakeCellElements.forEach((cell, index) => {
    //   const cellCoords = getCoordsFromCellIndex(index);
    //   const cellPosition = `translate(${cellCoords.col * 30}px, ${
    //     cellCoords.row * 30
    //   }px)`;
    //   cell.style.transform = cellPosition;
    // });
  };

  const handleFoodConsumption = (newSnakeCells) => {
    const maxCellValue = BOARD_ROW * BOARD_COL;
    let nextFood;
    while (true) {
      nextFood = randomIntFromInterval(1, maxCellValue);
      if (newSnakeCells.has(nextFood) || food === nextFood) continue;
      break;
    }
    setFood(nextFood);
    setScore(score + 1);
    if(score!==0 && score%2===0 && speed>=50){
      setSpeed((prev)=>{
        return prev-=15;
      })
      // console.log(speed);
    }
  };

  const handleGameOver = () => {
    setSpeed(200);
    playSound(gameOverAudio);
    setScore(0);
    setPlay(false);
    const snakeStartingValue = getStartingSnakeValue(board);
    setSnake(new LinkedList(snakeStartingValue));
    setFood(snakeStartingValue.cell + 5);
    setSnakeCells(new Set([snakeStartingValue.cell]));
    setDirection(Direction.RIGHT);
  };

  return (
    <>
    <div className="container">
      <h1 className="score">SCORE: {score}</h1>
      <div className="board">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((cellValue, cellIdx) => {
              const className = getCellClassName(
                cellValue,
                snakeCells,
                food,
                snake
              );
              return <div key={cellIdx} className={className}></div>;
            })}
          </div>
        ))}
      </div>
    </div>
    <div className = "instructions"> USE 'A', 'S', 'D', 'W' TO PLAY</div>
    </>
  );
}

const createBoard = (BOARD_ROW, BOARD_COL) => {
  let ct = 1;
  const board = [];
  for (let row = 0; row < BOARD_ROW; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_COL; col++) {
      currentRow.push(ct++);
    }
    board.push(currentRow);
  }
  return board;
};

const getCellClassName = (cellValue, snakeCells, food, snake) => {
  let className = "cell";
  if (cellValue === food) className = "cell food";
  if (snakeCells.has(cellValue)) className = "cell snake";
  if (cellValue === snake.tail.value.cell) className += " last-snake-cell";
  if (cellValue === snake.head.value.cell) className += " first-snake-cell";
  return className;
};

const getDirectionFromKey = (key) => {
  if (key === "w") return Direction.UP;
  if (key === "d") return Direction.RIGHT;
  if (key === "s") return Direction.DOWN;
  if (key === "a") return Direction.LEFT;
  return "";
};

const getCoordsInDirection = (coords, direction) => {
  if (direction === Direction.UP) {
    return {
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if (direction === Direction.DOWN) {
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
  if (direction === Direction.RIGHT) {
    return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
};

const isOutOfBounds = (coords, board) => {
  if (coords.row >= board.length || coords.col >= board[0].length) return true;
  if (coords.row < 0 || coords.col < 0) return true;
  return false;
};
