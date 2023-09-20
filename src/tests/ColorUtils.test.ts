import { describe, expect, it } from 'vitest';
import ColorUtils from '../utils/ColorUtils';

describe('ColorUtils', () => {
  describe('convertHexColorToBytes', () => {
    it('should throw if hex color has wrong value', () => {
      // @ts-expect-error testing invalid param type
      expect(() => ColorUtils.convertHexColorToBytes()).toThrowError(
        'Expected hexColor param to be a string instead got undefined',
      );
      expect(() => ColorUtils.convertHexColorToBytes('A')).toThrowError(
        'Expected hexColor to be of length 3, 4, 6 or 8 with 0-9 A-F characters, instead got A with length 1',
      );
      expect(() => ColorUtils.convertHexColorToBytes('red')).toThrowError(
        'Expected hexColor to be of length 3, 4, 6 or 8 with 0-9 A-F characters, instead got red with length 3',
      );
      expect(() => ColorUtils.convertHexColorToBytes('##FFF')).toThrowError(
        'Expected hexColor to be of length 3, 4, 6 or 8 with 0-9 A-F characters, instead got #FFF with length 4',
      );
    });

    it('should return bytes for hex color with alpha', () => {
      expect(ColorUtils.convertHexColorToBytes('#FFFFFFFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#00000000')).toEqual([
        0, 0, 0, 0,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#AABBCCDD')).toEqual([
        170, 187, 204, 221,
      ]);
    });

    it('should return bytes with default alpha for hex color without alpha', () => {
      expect(ColorUtils.convertHexColorToBytes('#FFFFFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#000000')).toEqual([
        0, 0, 0, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#AABBCC')).toEqual([
        170, 187, 204, 255,
      ]);
    });

    it('should return bytes for short hex color with alpha', () => {
      expect(ColorUtils.convertHexColorToBytes('#FFFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#0000')).toEqual([0, 0, 0, 0]);
      expect(ColorUtils.convertHexColorToBytes('#ABCD')).toEqual([
        170, 187, 204, 221,
      ]);
    });

    it('should return bytes with default alpha for short hex color without alpha', () => {
      expect(ColorUtils.convertHexColorToBytes('#FFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('#000')).toEqual([0, 0, 0, 255]);
      expect(ColorUtils.convertHexColorToBytes('#ABC')).toEqual([
        170, 187, 204, 255,
      ]);
    });

    it('should allow to use hex color without #', () => {
      expect(ColorUtils.convertHexColorToBytes('FFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('000')).toEqual([0, 0, 0, 255]);
      expect(ColorUtils.convertHexColorToBytes('ABC')).toEqual([
        170, 187, 204, 255,
      ]);

      expect(ColorUtils.convertHexColorToBytes('FFFA')).toEqual([
        255, 255, 255, 170,
      ]);
      expect(ColorUtils.convertHexColorToBytes('000A')).toEqual([0, 0, 0, 170]);
      expect(ColorUtils.convertHexColorToBytes('ABCA')).toEqual([
        170, 187, 204, 170,
      ]);

      expect(ColorUtils.convertHexColorToBytes('FFFFFF')).toEqual([
        255, 255, 255, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('0A0A0A')).toEqual([
        10, 10, 10, 255,
      ]);
      expect(ColorUtils.convertHexColorToBytes('0A0B0C')).toEqual([
        10, 11, 12, 255,
      ]);

      expect(ColorUtils.convertHexColorToBytes('FFFFFF0F')).toEqual([
        255, 255, 255, 15,
      ]);
      expect(ColorUtils.convertHexColorToBytes('0000000A')).toEqual([
        0, 0, 0, 10,
      ]);
      expect(ColorUtils.convertHexColorToBytes('42424242')).toEqual([
        66, 66, 66, 66,
      ]);
    });
  });
});
