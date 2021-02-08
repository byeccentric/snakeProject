import React, { PureComponent } from 'react';

import { EDirection, ICell, ISize } from 'types/gameTypes';
import {
  INITIAL_SNAKE_SIZE,
  SNAKE_COLOR,
  FOOD_COLOR,
  STROKE_COLOR,
  WHITE_COLOR,
  CELL_SIZE,
  SPEED_CONFIG,
} from 'constants/gameConst';
import { getNextHeadPosition, getRandomCoordinate, isSamePosition } from 'utils/coordinates';

interface ISnakeProps {
  width: number;
  height: number;
  speed: 'slow' | 'normal' | 'fast' | 'expert';
  handleGameOver: (score: number) => void;
}

interface ISnakeState {
  size: number;
  score: number;
  direction: EDirection;
  snakePosition: ICell[];
  foodPosition: ICell;
}

class Game extends PureComponent<ISnakeProps, ISnakeState> {
  canvas = React.createRef() as React.RefObject<HTMLCanvasElement>;

  timerId: any;

  public constructor(props) {
    super(props);
    this.state = {
      direction: EDirection.Right,
      size: INITIAL_SNAKE_SIZE,
      snakePosition: [],
      foodPosition: {
        x: -1,
        y: -1,
      },
      score: 0,
    };
  }

  public componentDidMount() {
    this.handleFocusCanvas();
    this.setCanvasSize();
    this.startGame();
  }

  /* Handlers */
  public handleKeyDown = (e: any): void => {
    const { direction } = this.state;

    let newDirection = null;

    switch (e.keyCode) {
      case 37:
      case 65:
        if (direction !== EDirection.Left && direction !== EDirection.Right) newDirection = EDirection.Left;
        break;
      case 38:
      case 87:
        if (direction !== EDirection.Up && direction !== EDirection.Down) newDirection = EDirection.Up;
        break;
      case 39:
      case 68:
        if (direction !== EDirection.Left && direction !== EDirection.Right) newDirection = EDirection.Right;
        break;
      case 40:
      case 83:
        if (direction !== EDirection.Up && direction !== EDirection.Down) newDirection = EDirection.Down;
        break;
      default:
        return;
    }

    if (newDirection) {
      this.setState({
        direction: newDirection,
      });
    }
  };

  public handleFocusCanvas() {
    const { canvas } = this;

    if (canvas && canvas.current) {
      canvas.current.focus();
    }
  }

  public handleSnakeInit(): void {
    const snakeSize = INITIAL_SNAKE_SIZE;

    const snakePosition = [];

    for (let i = snakeSize; i > 0; i -= 1) {
      const part = (i - 1) * CELL_SIZE;

      snakePosition.push({ x: part, y: 0 });
    }

    this.setState({ snakePosition }, () => this.renderSnake());
  }

  public handleSnakeMove = (): void => {
    const { direction, foodPosition, snakePosition, size, score } = this.state;

    let newSnakePosition = [];
    const canvasSize = this.getCanvasSize();
    const headCoordinates = snakePosition[0];
    const newHeadPosition = getNextHeadPosition(headCoordinates, direction, canvasSize);

    let newSize = size;
    let newScore = score;

    if (newHeadPosition) {
      if (isSamePosition(newHeadPosition, foodPosition)) {
        newSize += 1;
        newScore += 1;
        newSnakePosition = [newHeadPosition, ...snakePosition];
        this.setFoodPosition();
      } else {
        newSnakePosition = [newHeadPosition, ...snakePosition.slice(0, -1)];
      }

      this.setState(
        {
          snakePosition: newSnakePosition,
          direction,
          size: newSize,
          score: newScore,
        },
        () => this.renderSnake(),
      );
    }
  };

  /* Getters and Setters */

  public getCanvasContext(): CanvasRenderingContext2D | null {
    const { canvas } = this;

    if (canvas && canvas.current) {
      return canvas.current.getContext('2d');
    }

    return null;
  }

  public setCanvasSize(): void {
    const { canvas } = this;
    const { width, height } = this.props;

    if (canvas && canvas.current) {
      canvas.current.width = CELL_SIZE * width;
      canvas.current.height = CELL_SIZE * height;
    }
  }

  public getCanvasSize(): ISize | null {
    const { canvas } = this;

    if (canvas && canvas.current) {
      const { width, height } = canvas.current.getBoundingClientRect();

      return {
        width,
        height,
      };
    }

    return null;
  }

  public setFoodPosition(): void {
    const { snakePosition } = this.state;
    const { width, height } = this.props;

    const [x, y] = [getRandomCoordinate(width), getRandomCoordinate(height)];

    if (snakePosition.some((part) => isSamePosition({ x, y }, part))) {
      this.setFoodPosition();
    } else {
      this.setState({
        foodPosition: { x, y },
      });
    }
  }

  /* Game cicle */

  public step = (): void => {
    const { speed } = this.props;

    this.timerId = setTimeout(() => {
      const { snakePosition } = this.state;

      if (snakePosition.slice(1).some((item) => isSamePosition(item, snakePosition[0]))) {
        clearTimeout(this.timerId);
        this.endGame();
      } else {
        this.handleSnakeMove();
        window.requestAnimationFrame(this.step);
      }
    }, SPEED_CONFIG[speed] || SPEED_CONFIG.normal);
  };

  public startGame(): void {
    this.renderField();
    this.handleSnakeInit();
    this.setFoodPosition();
    this.step();
  }

  public endGame(): void {
    const { score } = this.state;
    const { handleGameOver } = this.props;
    handleGameOver(score);
  }

  /* Render */

  public renderSnake(): void {
    const { snakePosition } = this.state;

    this.renderField();
    this.renderFood();
    snakePosition.forEach((coordinate: ICell) => this.renderSquare(coordinate.x, coordinate.y, SNAKE_COLOR));
  }

  public renderSquare(x: number, y: number, color: string): void {
    const ctx = this.getCanvasContext();

    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }

  public renderField(): void {
    const ctx = this.getCanvasContext();
    const canvasSize = this.getCanvasSize();

    if (ctx && canvasSize) {
      const { width, height } = canvasSize;

      ctx.fillStyle = WHITE_COLOR;
      ctx.strokeStyle = STROKE_COLOR;
      ctx.fillRect(0, 0, width, height);

      for (let x = CELL_SIZE; x < width; x += CELL_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      for (let y = 0; y < height; y += CELL_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      ctx.stroke();
    }
  }

  public renderFood() {
    const { foodPosition } = this.state;

    if (foodPosition) {
      const { x, y } = foodPosition;

      this.renderSquare(x, y, FOOD_COLOR);
    }
  }

  public render() {
    return <canvas onKeyDown={this.handleKeyDown} className="canvas" ref={this.canvas} tabIndex={0} />;
  }
}

export default Game;
