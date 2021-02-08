export enum EDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export interface ICell {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}
