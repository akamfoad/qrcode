import { invariant } from './invariant';

export default class ColorUtils {
  static convertHexColorToBytes(hexColor: string): number[] {
    invariant(
      typeof hexColor === 'string',
      `Expected hexColor param to be a string instead got ${typeof hexColor}`,
    );

    let hex = hexColor.replace('#', '');

    const isHexColor =
      /^([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex);

    invariant(
      isHexColor,
      `Expected hexColor to be of length 3, 4, 6 or 8 with 0-9 A-F characters, instead got ${hex} with length ${hex.length}`,
    );

    const bytes: number[] = [];

    if (hex.length === 3) {
      hex += 'F';
    } else if (hex.length === 6) {
      hex += 'FF';
    }

    if (hex.length === 4) {
      bytes.push(...hex.split('').map((h) => parseInt(h.repeat(2), 16)));
    } else if (hex.length === 8) {
      bytes.push(parseInt(hex.substring(0, 2), 16));
      bytes.push(parseInt(hex.substring(2, 4), 16));
      bytes.push(parseInt(hex.substring(4, 6), 16));
      bytes.push(parseInt(hex.substring(6, 8), 16));
    }

    return bytes;
  }
}
