import { invariant } from './invariant';

type Position = 'left' | 'right' | 'top' | 'bottom';
type PositionsWithCenter = Position | 'center';

export default class DimensionUtils {
  static calculateDimension(
    value: string | number,
    canvasSize: number,
  ): number {
    const isNumber = typeof value === 'number';
    const isString = typeof value === 'string';

    invariant(
      isNumber || isString,
      `value must be either string or number, instead got ${typeof value}`,
    );

    if (isNumber) {
      return value;
    }

    if (value.indexOf('%') > 0) {
      return Math.round((parseFloat(value) / 100) * canvasSize) || 0;
    }

    return parseFloat(value) || 0;
  }

  static calculatePosition(
    value:
      | number
      | PositionsWithCenter
      | `${number}`
      | `${number}%`
      | `${Position} ${number}`
      | `${Position} ${number}%`,
    size: number,
    canvasSize: number,
  ): number {
    const isNumber = typeof value === 'number';
    const isString = typeof value === 'string';

    invariant(
      isNumber || isString,
      `value must be either string or number, instead got ${typeof value}`,
    );

    if (isNumber) return value;

    // if (typeof value !== 'string') {
    //   return 0;
    // }
    if (value === 'left' || value === 'top') {
      return 0;
    }
    if (value === 'right' || value === 'bottom') {
      return canvasSize - size;
    }
    if (value === 'center') {
      return Math.round((canvasSize - size) / 2);
    }

    const match = value.match(
      /^(?:(right|bottom|left|top)\s+)?(-?[0-9.]+)(%)?$/,
    );

    invariant(!!match, `Expected position with number, instead got ${value}`);

    const isRight = match[1] === 'right' || match[1] === 'bottom';
    const isPercent = !!match[3];
    let val = parseFloat(match[2]) || 0;

    if (isPercent) {
      val = Math.round((val / 100) * canvasSize);
    }
    if (isRight) {
      val = canvasSize - val - size;
    }
    return Math.round(val);
  }
}
