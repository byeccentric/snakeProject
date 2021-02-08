import React, { PureComponent } from 'react';

import {Direction, ICell, ISize} from 'types/gameTypes';
import {INITIAL_SNAKE_SIZE, SNAKE_COLOR, FOOD_COLOR, STROKE_COLOR, WHITE_COLOR, CELL_SIZE, SPEED_CONFIG} from 'constants/gameConst';
import {getNextHeadPosition, getRandomCoordinate, isSamePosition} from 'utils/coordinates';

interface ISnakeProps {
    width: number;
    height: number;
    speed: 'slow' | 'normal' | 'fast' | 'expert';
    handleGameOver: (score: number) => void;
}

interface ISnakeState {
    size: number;
    score: number;
    direction: Direction;
    snakePosition: ICell[];
    foodPosition: ICell;
}

class Game extends PureComponent<ISnakeProps, ISnakeState> {
    canvas = React.createRef() as React.RefObject<HTMLCanvasElement>;
    timerId: any;

    state = {
        direction: Direction.Right,
        size: INITIAL_SNAKE_SIZE,
        snakePosition: [],
        foodPosition: {
            x: -1,
            y: -1,
        },
        score: 0,
    };

    public componentDidMount() {
        this.focusCanvas();
        this.setCanvasSize();
        this.startGame();
    }

    public focusCanvas() {
        const {canvas} = this;

        if (canvas && canvas.current) {
            canvas.current.focus();
        }
    }

    /**
     * @method getCanvasContext
     * @returns {CanvasRenderingContext2D | null}
     * @description Gets canvas context.
     */

    public getCanvasContext(): CanvasRenderingContext2D | null {
        const {canvas} = this;

        if (canvas && canvas.current) {
            return canvas.current.getContext('2d');
        }

        return null;
    };

    /**
     * @method setCanvasSize
     * @description Sets canvas size from cell size (props) and field length (constants).
     */

    public setCanvasSize(): void {
        const {canvas} = this;
        const {width, height} = this.props;

        if (canvas && canvas.current) {
            canvas.current.width = CELL_SIZE * width;
            canvas.current.height = CELL_SIZE * height;
        }
    };

    /**
     * @method getCanvasSize
     * @returns {{width: number, height: number} | null}
     * @description Gets canvas size width & height.
     */

    public getCanvasSize(): ISize | null {
        const {canvas} = this;

        if (canvas && canvas.current) {
            const {width, height} = canvas.current.getBoundingClientRect();

            return {
                width,
                height,
            };
        }

        return null;
    }

    /**
     * @method renderSquare
     * @param {number} x
     * @param {number} y
     * @param {string} color
     * @description Gets canvas context and renders rectangle.
     */

    public renderSquare(x: number, y: number, color: string): void {
        const ctx = this.getCanvasContext();

        if (ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }

    /**
     * @method renderGrid
     * @description Gets canvas context, size and renders grid with cell size step.
     */

    public renderGrid(): void {
        const ctx = this.getCanvasContext();
        const canvasSize = this.getCanvasSize();

        if (ctx && canvasSize) {
            const {width, height} = canvasSize;

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

    /**
     * @method setInitialSnake
     * @description Set initial snake position (tail on {x: 0, y: 0}), size (constants), direction and score.
     * Renders snake.
     */

    public setInitialSnake(): void {
        const snakeSize = INITIAL_SNAKE_SIZE;

        const snakePosition = [];

        for (let i = snakeSize; i > 0; i--) {
            const part = (i - 1) * CELL_SIZE;

            snakePosition.push({ x: part, y: 0 })
        }

        this.setState({snakePosition}, () => this.renderSnake());
    }

    /**
     * @method renderSnake
     * @description Gets snake coordinates from state and renders it to canvas. Re-renders grid and food.
     */

    public renderSnake(): void {
        const {snakePosition} = this.state;

        this.renderGrid();
        this.renderFood();
        snakePosition.forEach((coordinate: ICell) => this.renderSquare(coordinate.x, coordinate.y, SNAKE_COLOR));
    }

    public moveSnake = (): void => {
        const {direction, foodPosition, snakePosition, size, score} = this.state;

        let newSnakePosition = [];
        const canvasSize = this.getCanvasSize();
        const headCoordinates = snakePosition[0];
        const newHeadPosition = getNextHeadPosition(headCoordinates, direction, canvasSize);

        let newSize = size;
        let newScore = score;

        if (newHeadPosition) {
            if (isSamePosition(newHeadPosition, foodPosition)) {
                newSize++;
                newScore++;
                newSnakePosition = [newHeadPosition, ...snakePosition];
                this.setFood();
            } else {
                newSnakePosition = [newHeadPosition, ...snakePosition.slice(0, -1)]
            }

            this.setState({
                snakePosition: newSnakePosition,
                direction,
                size: newSize,
                score: newScore,
            }, () => this.renderSnake());
        }
    };

    /**
     * @method handleKeyDown
     * @description Changes direction if event keyCode matches with arrows keyCodes or WASD keyCodes.
     */

    public handleKeyDown = (e: any): void => {
        const {direction} = this.state;

        let newDirection = null;

        switch (e.keyCode) {
            case 37:
            case 65:
                if (direction !== Direction.Left && direction !== Direction.Right) newDirection = Direction.Left;
                break;
            case 38:
            case 87:
                if (direction !== Direction.Up && direction !== Direction.Down) newDirection = Direction.Up;
                break;
            case 39:
            case 68:
                if (direction !== Direction.Left && direction !== Direction.Right) newDirection = Direction.Right;
                break;
            case 40:
            case 83:
                if (direction !== Direction.Up && direction !== Direction.Down) newDirection = Direction.Down;
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

    /**
     * @method setFood
     * @description Sets food random coordinate. Checks collision with snake.
     */

    public setFood(): void {
        const {snakePosition} = this.state;
        const {width, height} = this.props;

        const [ x, y ] = [ getRandomCoordinate(width), getRandomCoordinate(height) ];

        if (snakePosition.some(part => isSamePosition({x, y}, part))) {
            this.setFood();
        } else {
            this.setState({
                foodPosition: {x, y}
            });
        }
    }

    /**
     * @method renderFood
     * @description Gets food coordinate from state. Renders food.
     */

    public renderFood() {
        const foodPosition = this.state.foodPosition;

        if (foodPosition) {
            const {x, y} = foodPosition;

            this.renderSquare(x, y, FOOD_COLOR);
        }
    }

    /**
     * @method loop
     * @description Main game loop. Checks collision when snake's head hits the body.
     */

    public loop = (): void => {
        const {speed} = this.props;

        this.timerId = setTimeout(() => {
            const {snakePosition} = this.state;

            if (snakePosition.slice(1).some(item => isSamePosition(item, snakePosition[0]))) {
                clearTimeout(this.timerId);
                this.endGame();

            } else {
                this.moveSnake();
                window.requestAnimationFrame(this.loop);
            }
        }, SPEED_CONFIG[speed] || SPEED_CONFIG.normal);
    };

    /**
     * @method startGame
     * @description Starts game, renders grid, snake and food.
     */

    public startGame(): void {
        this.renderGrid();
        this.setInitialSnake();
        this.setFood();
        this.loop();
    }

    /**
     * @method endGame
     * @description Called when game is ended
     */

    public endGame(): void {
        const {score} = this.state;
        const {handleGameOver} = this.props;
        handleGameOver(score);
    }

    public render() {
        return (
            <canvas onKeyDown={this.handleKeyDown} className="canvas" ref={this.canvas} tabIndex={0} />
        );
    }
}

export default Game;
