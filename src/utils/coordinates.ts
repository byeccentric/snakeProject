import { ICell, EDirection } from 'types/gameTypes';
import { CELL_SIZE } from 'constants/gameConst';

export const getRandomCoordinate = (size: number): number => Math.floor(Math.random() * size) * CELL_SIZE;

export const isSamePosition = (a: ICell, b: ICell): boolean => a.x === b.x && a.y === b.y;

export const getNextHeadPosition = (
  headPosition: ICell,
  direction: EDirection,
  canvasSize: {
    width: number;
    height: number;
  },
): ICell | null => {
  if (headPosition) {
    let { x, y } = headPosition;

    switch (direction) {
      case EDirection.Right:
        x += CELL_SIZE;
        break;
      case EDirection.Left:
        x -= CELL_SIZE;
        break;
      case EDirection.Up:
        y -= CELL_SIZE;
        break;
      case EDirection.Down:
        y += CELL_SIZE;
        break;
      default:
        return null;
    }

    if (x < 0) {
      x = canvasSize.width - CELL_SIZE;
    }

    if (y < 0) {
      y = canvasSize.height - CELL_SIZE;
    }

    if (x > canvasSize.width - CELL_SIZE) {
      x = 0;
    }

    if (y > canvasSize.height - CELL_SIZE) {
      y = 0;
    }

    return { x, y };
  }

  return null;
};
