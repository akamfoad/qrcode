import { describe, expect, it, vi } from 'vitest';
import QRCodeSVG, { DataIntType } from '../QRCodeSVG';

describe('QRCodeSVG', () => {
  it('should has length of toDataUrl().length less on about 20% than btoa(toString())', () => {
    // @ts-expect-error testing undefined case
    const qrCode = new QRCodeSVG();
    [
      '0',
      '42',
      'foo',
      'John Doe',
      'https://github.com/cheprasov/js-qrcode',
      '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214' +
        '80865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109' +
        '7566593344612847564823378678316527120190914',
      ...Array.from({ length: 100 }).map((_, i) => i),
    ].forEach((value) => {
      if (typeof value === 'number') {
        qrCode.setValue(value.toString(32).repeat(value + 1));
      } else {
        qrCode.setValue(value);
      }

      expect(
        1 - qrCode.toDataUrl().length / btoa(qrCode.toString()).length,
      ).toBeGreaterThan(0.2);
    });
  });

  describe('constructor', () => {
    it('should use default params if nothing is provided', () => {
      // @ts-expect-error testing undefined case
      const qrCode = new QRCodeSVG();
      expect(qrCode.value).toBeUndefined();
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('L');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
      expect(qrCode.fgColor).toEqual('#000');
      expect(qrCode.bgColor).toEqual('#FFF');
    });

    it('should default params for not specified params', () => {
      const qrCode = new QRCodeSVG('test 42', { level: 'Q' });
      expect(qrCode.value).toEqual('test 42');
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('Q');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
      expect(qrCode.fgColor).toEqual('#000');
      expect(qrCode.bgColor).toEqual('#FFF');
    });

    it('should use specified params', () => {
      const qrCode = new QRCodeSVG('test 84', {
        level: 'H',
        padding: 0,
        typeNumber: 20,
        invert: true,
        errorsEnabled: true,
        fgColor: '#AAA',
        bgColor: '#FFF',
      });
      expect(qrCode.value).toEqual('test 84');
      expect(qrCode.padding).toEqual(0);
      expect(qrCode.level).toEqual('H');
      expect(qrCode.typeNumber).toEqual(20);
      expect(qrCode.errorsEnabled).toBeTruthy();
      expect(qrCode.invert).toBeTruthy();
      expect(qrCode.fgColor).toEqual('#AAA');
      expect(qrCode.bgColor).toEqual('#FFF');
    });
  });

  describe('_clearCache', () => {
    it('should clear qrCodeData and qrCodeText', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.qrCodeData = [[false], [true], [true], [true]];
      qrCode.qrCodeSVG = '<svg />';
      qrCode.qrCodeDataUrl = 'data:some-42';
      qrCode._clearCache();
      expect(qrCode.qrCodeData).toBeNull();
      expect(qrCode.qrCodeDataUrl).toBeNull();
    });
  });

  describe('_getDataInt', () => {
    it('should return null if data are empty', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode._getDataInt()).toBeNull();
    });

    it('should convert boolean[][] to number[][]', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => [
        [true, true, true, true],
        [false, true, true, false],
        [true, false, false, true],
        [true, true, true, true],
      ]);
      expect(qrCode._getDataInt()).toEqual([
        [1, 1, 1, 1],
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
      ]);
    });

    it('should return qr code data int', () => {
      const qrCode = new QRCodeSVG('test');
      expect(qrCode._getDataInt()).toEqual([
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]);
    });
  });

  describe('_getRects', () => {
    it('should return null if qr code data are empty', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode._getRects()).toBeNull();
    });

    it('should return rects from qr code data', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode._getDataInt = vi.fn(() => [
        //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], // 1
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 2
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 3
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 4
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 5
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 6
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0], // 9
        [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0], // 10
        [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0], // 11
        [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0], // 12
        [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0], // 13
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0], // 14
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0], // 15
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0], // 16
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0], // 17
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0], // 18
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], // 19
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0], // 20
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // 21
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 22
      ]);

      expect(qrCode._getRects()).toEqual([
        { height: 1, width: 7, x: 1, y: 1 },
        { height: 1, width: 2, x: 9, y: 1 },
        { height: 3, width: 1, x: 13, y: 1 },
        { height: 1, width: 7, x: 15, y: 1 },
        { height: 6, width: 1, x: 1, y: 2 },
        { height: 6, width: 1, x: 7, y: 2 },
        { height: 1, width: 1, x: 10, y: 2 },
        { height: 6, width: 1, x: 15, y: 2 },
        { height: 6, width: 1, x: 21, y: 2 },
        { height: 3, width: 3, x: 3, y: 3 },
        { height: 3, width: 1, x: 9, y: 3 },
        { height: 1, width: 1, x: 11, y: 3 },
        { height: 3, width: 3, x: 17, y: 3 },
        { height: 1, width: 1, x: 12, y: 4 },
        { height: 1, width: 2, x: 10, y: 5 },
        { height: 1, width: 5, x: 2, y: 7 },
        { height: 1, width: 1, x: 9, y: 7 },
        { height: 9, width: 1, x: 11, y: 7 },
        { height: 1, width: 1, x: 13, y: 7 },
        { height: 1, width: 5, x: 16, y: 7 },
        { height: 1, width: 1, x: 10, y: 8 },
        { height: 1, width: 4, x: 1, y: 9 },
        { height: 1, width: 1, x: 7, y: 9 },
        { height: 1, width: 1, x: 9, y: 9 },
        { height: 1, width: 1, x: 14, y: 9 },
        { height: 1, width: 3, x: 17, y: 9 },
        { height: 3, width: 1, x: 21, y: 9 },
        { height: 3, width: 1, x: 1, y: 10 },
        { height: 1, width: 3, x: 4, y: 10 },
        { height: 1, width: 1, x: 8, y: 10 },
        { height: 3, width: 1, x: 13, y: 10 },
        { height: 2, width: 1, x: 16, y: 10 },
        { height: 1, width: 2, x: 18, y: 10 },
        { height: 3, width: 1, x: 3, y: 11 },
        { height: 1, width: 3, x: 5, y: 11 },
        { height: 1, width: 2, x: 14, y: 11 },
        { height: 1, width: 1, x: 17, y: 11 },
        { height: 4, width: 1, x: 20, y: 11 },
        { height: 1, width: 1, x: 4, y: 12 },
        { height: 1, width: 2, x: 8, y: 12 },
        { height: 5, width: 1, x: 14, y: 12 },
        { height: 5, width: 1, x: 18, y: 12 },
        { height: 1, width: 1, x: 2, y: 13 },
        { height: 1, width: 1, x: 5, y: 13 },
        { height: 1, width: 1, x: 7, y: 13 },
        { height: 1, width: 1, x: 10, y: 13 },
        { height: 1, width: 1, x: 12, y: 13 },
        { height: 1, width: 1, x: 17, y: 13 },
        { height: 1, width: 1, x: 9, y: 14 },
        { height: 1, width: 1, x: 16, y: 14 },
        { height: 1, width: 7, x: 1, y: 15 },
        { height: 3, width: 1, x: 15, y: 15 },
        { height: 1, width: 1, x: 17, y: 15 },
        { height: 3, width: 1, x: 19, y: 15 },
        { height: 6, width: 1, x: 1, y: 16 },
        { height: 6, width: 1, x: 7, y: 16 },
        { height: 3, width: 1, x: 10, y: 16 },
        { height: 1, width: 2, x: 12, y: 16 },
        { height: 3, width: 3, x: 3, y: 17 },
        { height: 1, width: 2, x: 11, y: 17 },
        { height: 1, width: 2, x: 20, y: 17 },
        { height: 4, width: 1, x: 9, y: 18 },
        { height: 2, width: 1, x: 14, y: 18 },
        { height: 1, width: 2, x: 17, y: 18 },
        { height: 1, width: 1, x: 20, y: 18 },
        { height: 2, width: 2, x: 11, y: 19 },
        { height: 2, width: 1, x: 17, y: 19 },
        { height: 1, width: 1, x: 19, y: 19 },
        { height: 2, width: 1, x: 10, y: 20 },
        { height: 2, width: 1, x: 13, y: 20 },
        { height: 1, width: 1, x: 15, y: 20 },
        { height: 1, width: 1, x: 18, y: 20 },
        { height: 1, width: 1, x: 21, y: 20 },
        { height: 1, width: 5, x: 2, y: 21 },
        { height: 1, width: 1, x: 12, y: 21 },
        { height: 1, width: 1, x: 16, y: 21 },
      ]);
    });
  });

  describe('_processRect', () => {
    it('should return null if rect has any new block', () => {
      const qrCode = new QRCodeSVG('test');

      const dataInt: DataIntType = [
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
      ];
      expect(qrCode._processRect(dataInt, 0, 2, 0)).toBeNull();
      expect(qrCode._processRect(dataInt, 4, 6, 0)).toBeNull();
      expect(qrCode._processRect(dataInt, 10, 2, 0)).toBeNull();
      expect(qrCode._processRect(dataInt, 4, 6, 3)).toBeNull();
      expect(qrCode._processRect(dataInt, 1, 2, 0)).toBeNull();
      expect(qrCode._processRect(dataInt, 9, 10, 1)).toBeNull();
    });

    it('should return calculate single block', () => {
      const qrCode = new QRCodeSVG('test');

      const dataInt: DataIntType = [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ];
      expect(qrCode._processRect(dataInt, 0, 0, 0)).toEqual({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(dataInt).toEqual([
        [2, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ]);
      expect(qrCode._processRect(dataInt, 1, 1, 1)).toEqual({
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      });
      expect(dataInt).toEqual([
        [2, 0, 1, 0],
        [0, 2, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ]);
      expect(qrCode._processRect(dataInt, 3, 3, 1)).toEqual({
        x: 3,
        y: 1,
        width: 1,
        height: 1,
      });
      expect(dataInt).toEqual([
        [2, 0, 1, 0],
        [0, 2, 0, 2],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ]);
    });

    it('should return rect if it has at least one new block', () => {
      const qrCode = new QRCodeSVG('test');

      const dataInt: DataIntType = [
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 1, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 1, 0, 2, 1, 2, 0], // 3
      ];

      expect(qrCode._processRect(dataInt, 1, 2, 0)).toEqual({
        x: 1,
        y: 0,
        width: 2,
        height: 3,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 1, 0, 2, 1, 2, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 4, 6, 2)).toEqual({
        x: 4,
        y: 2,
        width: 3,
        height: 2,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 2, 1, 2, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 8, 10, 3)).toEqual({
        x: 8,
        y: 3,
        width: 3,
        height: 1,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
      ]);
    });

    it('should return full rect and mark checked area as processed', () => {
      const qrCode = new QRCodeSVG('test');

      const dataInt: DataIntType = [
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1], // 0
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
        [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
      ];

      expect(qrCode._processRect(dataInt, 0, 2, 0)).toEqual({
        x: 0,
        y: 0,
        width: 3,
        height: 1,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 1, 1, 1, 0, 0, 1, 1, 1], // 0
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
        [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 4, 6, 0)).toEqual({
        x: 4,
        y: 0,
        width: 3,
        height: 1,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 1, 1, 1], // 0
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
        [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 9, 11, 0)).toEqual({
        x: 9,
        y: 0,
        width: 3,
        height: 2,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 2, 2, 2], // 1
        [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 1, 2, 1)).toEqual({
        x: 1,
        y: 1,
        width: 2,
        height: 2,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 5, 5, 1)).toEqual({
        x: 5,
        y: 1,
        width: 1,
        height: 3,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 9, 11, 1)).toBeNull();
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 1, 2, 2)).toBeNull();
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 4, 6, 2)).toEqual({
        x: 4,
        y: 2,
        width: 3,
        height: 2,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 1, 1, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 1, 1, 1, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 9, 10, 2)).toEqual({
        x: 9,
        y: 2,
        width: 2,
        height: 2,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 1, 2, 2, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 4, 6, 3)).toBeNull();
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 1, 2, 2, 0], // 3
      ]);

      expect(qrCode._processRect(dataInt, 8, 10, 3)).toEqual({
        x: 8,
        y: 3,
        width: 3,
        height: 1,
      });
      expect(dataInt).toEqual([
        //  1  2  3  4  5  6  7  8  9  10 11 x / y
        [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
        [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
        [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
        [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
      ]);
    });
  });

  describe('_getRelativeRects', () => {
    it('should return null if data are empty', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode._getRelativeRects()).toBeNull();
    });

    it('should should use relative rect for similar rects', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode._getRects = vi.fn(() => [
        { x: 1, y: 1, width: 7, height: 1 },
        { x: 9, y: 1, width: 2, height: 1 },
        { x: 13, y: 1, width: 1, height: 3 },
        { x: 15, y: 1, width: 7, height: 1 },
        { x: 1, y: 2, width: 1, height: 6 },
        { x: 7, y: 2, width: 1, height: 6 },
        { x: 10, y: 2, width: 1, height: 1 },
        { x: 15, y: 2, width: 1, height: 6 },
        { x: 21, y: 2, width: 1, height: 6 },
        { x: 3, y: 3, width: 3, height: 3 },
        { x: 9, y: 3, width: 1, height: 3 },
        { x: 11, y: 3, width: 1, height: 1 },
        { x: 17, y: 3, width: 3, height: 3 },
        { x: 12, y: 4, width: 1, height: 1 },
        { x: 9, y: 5, width: 3, height: 1 },
        { x: 1, y: 7, width: 7, height: 1 },
        { x: 9, y: 7, width: 1, height: 1 },
        { x: 11, y: 7, width: 1, height: 9 },
        { x: 13, y: 7, width: 1, height: 1 },
        { x: 15, y: 7, width: 7, height: 1 },
        { x: 10, y: 8, width: 2, height: 1 },
        { x: 1, y: 9, width: 4, height: 1 },
        { x: 7, y: 9, width: 1, height: 1 },
        { x: 9, y: 9, width: 1, height: 1 },
        { x: 14, y: 9, width: 1, height: 1 },
        { x: 17, y: 9, width: 3, height: 1 },
        { x: 21, y: 9, width: 1, height: 3 },
        { x: 1, y: 10, width: 1, height: 3 },
        { x: 4, y: 10, width: 3, height: 1 },
        { x: 8, y: 10, width: 1, height: 1 },
        { x: 13, y: 10, width: 1, height: 3 },
        { x: 16, y: 10, width: 1, height: 2 },
        { x: 18, y: 10, width: 2, height: 1 },
        { x: 3, y: 11, width: 1, height: 3 },
        { x: 5, y: 11, width: 3, height: 1 },
        { x: 13, y: 11, width: 5, height: 1 },
        { x: 20, y: 11, width: 2, height: 1 },
        { x: 3, y: 12, width: 2, height: 1 },
        { x: 8, y: 12, width: 2, height: 1 },
        { x: 13, y: 12, width: 2, height: 1 },
        { x: 18, y: 12, width: 1, height: 5 },
        { x: 20, y: 12, width: 1, height: 3 },
        { x: 2, y: 13, width: 2, height: 1 },
        { x: 5, y: 13, width: 1, height: 1 },
        { x: 7, y: 13, width: 1, height: 1 },
        { x: 10, y: 13, width: 3, height: 1 },
        { x: 14, y: 13, width: 1, height: 4 },
        { x: 17, y: 13, width: 2, height: 1 },
        { x: 9, y: 14, width: 1, height: 1 },
        { x: 16, y: 14, width: 1, height: 1 },
        { x: 1, y: 15, width: 7, height: 1 },
        { x: 14, y: 15, width: 2, height: 2 },
        { x: 17, y: 15, width: 3, height: 1 },
        { x: 1, y: 16, width: 1, height: 6 },
        { x: 7, y: 16, width: 1, height: 6 },
        { x: 10, y: 16, width: 1, height: 3 },
        { x: 12, y: 16, width: 4, height: 1 },
        { x: 18, y: 16, width: 2, height: 1 },
        { x: 3, y: 17, width: 3, height: 3 },
        { x: 10, y: 17, width: 3, height: 1 },
        { x: 15, y: 17, width: 1, height: 1 },
        { x: 19, y: 17, width: 3, height: 1 },
        { x: 9, y: 18, width: 2, height: 1 },
        { x: 14, y: 18, width: 1, height: 2 },
        { x: 17, y: 18, width: 2, height: 1 },
        { x: 20, y: 18, width: 1, height: 1 },
        { x: 9, y: 19, width: 1, height: 3 },
        { x: 11, y: 19, width: 2, height: 2 },
        { x: 17, y: 19, width: 1, height: 2 },
        { x: 19, y: 19, width: 1, height: 1 },
        { x: 9, y: 20, width: 5, height: 1 },
        { x: 15, y: 20, width: 1, height: 1 },
        { x: 17, y: 20, width: 2, height: 1 },
        { x: 21, y: 20, width: 1, height: 1 },
        { x: 1, y: 21, width: 7, height: 1 },
        { x: 9, y: 21, width: 2, height: 1 },
        { x: 12, y: 21, width: 2, height: 1 },
        { x: 16, y: 21, width: 1, height: 1 },
      ]);
      expect(qrCode._getRelativeRects()).toEqual([
        { x: 1, y: 1, width: 7, height: 1, id: 'i0' },
        { x: 9, y: 1, width: 2, height: 1, id: 'i5' },
        { x: 13, y: 1, width: 1, height: 3, id: 'i2' },
        { id: 'i0', x: 14, y: 0 },
        { x: 1, y: 2, width: 1, height: 6, id: 'i1' },
        { id: 'i1', x: 6, y: 0 },
        { x: 10, y: 2, width: 1, height: 1, id: 'i3' },
        { id: 'i1', x: 14, y: 0 },
        { id: 'i1', x: 20, y: 0 },
        { x: 3, y: 3, width: 3, height: 3, id: 'i4' },
        { id: 'i2', x: -4, y: 2 },
        { id: 'i3', x: 1, y: 1 },
        { id: 'i4', x: 14, y: 0 },
        { id: 'i3', x: 2, y: 2 },
        { x: 9, y: 5, width: 3, height: 1, id: 'i6' },
        { id: 'i0', x: 0, y: 6 },
        { id: 'i3', x: -1, y: 5 },
        { x: 11, y: 7, width: 1, height: 9 },
        { id: 'i3', x: 3, y: 5 },
        { id: 'i0', x: 14, y: 6 },
        { id: 'i5', x: 1, y: 7 },
        { x: 1, y: 9, width: 4, height: 1, id: 'i7' },
        { id: 'i3', x: -3, y: 7 },
        { id: 'i3', x: -1, y: 7 },
        { id: 'i3', x: 4, y: 7 },
        { id: 'i6', x: 8, y: 4 },
        { id: 'i2', x: 8, y: 8 },
        { id: 'i2', x: -12, y: 9 },
        { id: 'i6', x: -5, y: 5 },
        { id: 'i3', x: -2, y: 8 },
        { id: 'i2', x: 0, y: 9 },
        { x: 16, y: 10, width: 1, height: 2, id: 'i8' },
        { id: 'i5', x: 9, y: 9 },
        { id: 'i2', x: -10, y: 10 },
        { id: 'i6', x: -4, y: 6 },
        { x: 13, y: 11, width: 5, height: 1, id: 'ia' },
        { id: 'i5', x: 11, y: 10 },
        { id: 'i5', x: -6, y: 11 },
        { id: 'i5', x: -1, y: 11 },
        { id: 'i5', x: 4, y: 11 },
        { x: 18, y: 12, width: 1, height: 5 },
        { id: 'i2', x: 7, y: 11 },
        { id: 'i5', x: -7, y: 12 },
        { id: 'i3', x: -5, y: 11 },
        { id: 'i3', x: -3, y: 11 },
        { id: 'i6', x: 1, y: 8 },
        { x: 14, y: 13, width: 1, height: 4 },
        { id: 'i5', x: 8, y: 12 },
        { id: 'i3', x: -1, y: 12 },
        { id: 'i3', x: 6, y: 12 },
        { id: 'i0', x: 0, y: 14 },
        { x: 14, y: 15, width: 2, height: 2, id: 'i9' },
        { id: 'i6', x: 8, y: 10 },
        { id: 'i1', x: 0, y: 14 },
        { id: 'i1', x: 6, y: 14 },
        { id: 'i2', x: -3, y: 15 },
        { id: 'i7', x: 11, y: 7 },
        { id: 'i5', x: 9, y: 15 },
        { id: 'i4', x: 0, y: 14 },
        { id: 'i6', x: 1, y: 12 },
        { id: 'i3', x: 5, y: 15 },
        { id: 'i6', x: 10, y: 12 },
        { id: 'i5', x: 0, y: 17 },
        { id: 'i8', x: -2, y: 8 },
        { id: 'i5', x: 8, y: 17 },
        { id: 'i3', x: 10, y: 16 },
        { id: 'i2', x: -4, y: 18 },
        { id: 'i9', x: -3, y: 4 },
        { id: 'i8', x: 1, y: 9 },
        { id: 'i3', x: 9, y: 17 },
        { id: 'ia', x: -4, y: 9 },
        { id: 'i3', x: 5, y: 18 },
        { id: 'i5', x: 8, y: 19 },
        { id: 'i3', x: 11, y: 18 },
        { id: 'i0', x: 0, y: 20 },
        { id: 'i5', x: 0, y: 20 },
        { id: 'i5', x: 3, y: 20 },
        { id: 'i3', x: 6, y: 19 },
      ]);
    });
  });

  describe('_buildSVG', () => {
    it('should build empty svg without background', () => {
      const qrCode = new QRCodeSVG('test', { bgColor: null });
      qrCode.getDataSize = vi.fn(() => 42);
      expect(qrCode._buildSVG([])).toMatchSnapshot();
    });

    it('should build empty svg with background', () => {
      const qrCode = new QRCodeSVG('test', { bgColor: 'red' });
      qrCode.getDataSize = vi.fn(() => 42);
      expect(qrCode._buildSVG([])).toMatchSnapshot();
    });

    it('should build svg by rects', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getDataSize = vi.fn(() => 42);

      expect(
        qrCode._buildSVG([
          { x: 1, y: 1, width: 7, height: 1 },
          { x: 9, y: 1, width: 2, height: 1 },
          { x: 13, y: 1, width: 1, height: 3 },
          { x: 15, y: 1, width: 7, height: 1 },
          { x: 1, y: 2, width: 1, height: 6 },
          { x: 7, y: 2, width: 1, height: 6 },
          { x: 10, y: 2, width: 1, height: 1 },
          { x: 15, y: 2, width: 1, height: 6 },
          { x: 21, y: 2, width: 1, height: 6 },
          { x: 3, y: 3, width: 3, height: 3 },
          { x: 9, y: 3, width: 1, height: 3 },
          { x: 11, y: 3, width: 1, height: 1 },
          { x: 17, y: 3, width: 3, height: 3 },
          { x: 12, y: 4, width: 1, height: 1 },
          { x: 9, y: 5, width: 3, height: 1 },
          { x: 1, y: 7, width: 7, height: 1 },
          { x: 9, y: 7, width: 1, height: 1 },
          { x: 11, y: 7, width: 1, height: 9 },
          { x: 13, y: 7, width: 1, height: 1 },
          { x: 15, y: 7, width: 7, height: 1 },
          { x: 10, y: 8, width: 2, height: 1 },
          { x: 1, y: 9, width: 4, height: 1 },
          { x: 7, y: 9, width: 1, height: 1 },
          { x: 9, y: 9, width: 1, height: 1 },
          { x: 14, y: 9, width: 1, height: 1 },
          { x: 17, y: 9, width: 3, height: 1 },
          { x: 21, y: 9, width: 1, height: 3 },
          { x: 1, y: 10, width: 1, height: 3 },
          { x: 4, y: 10, width: 3, height: 1 },
          { x: 8, y: 10, width: 1, height: 1 },
          { x: 13, y: 10, width: 1, height: 3 },
          { x: 16, y: 10, width: 1, height: 2 },
          { x: 18, y: 10, width: 2, height: 1 },
          { x: 3, y: 11, width: 1, height: 3 },
          { x: 5, y: 11, width: 3, height: 1 },
          { x: 13, y: 11, width: 5, height: 1 },
          { x: 20, y: 11, width: 2, height: 1 },
          { x: 3, y: 12, width: 2, height: 1 },
          { x: 8, y: 12, width: 2, height: 1 },
          { x: 13, y: 12, width: 2, height: 1 },
          { x: 18, y: 12, width: 1, height: 5 },
          { x: 20, y: 12, width: 1, height: 3 },
          { x: 2, y: 13, width: 2, height: 1 },
          { x: 5, y: 13, width: 1, height: 1 },
          { x: 7, y: 13, width: 1, height: 1 },
          { x: 10, y: 13, width: 3, height: 1 },
          { x: 14, y: 13, width: 1, height: 4 },
          { x: 17, y: 13, width: 2, height: 1 },
          { x: 9, y: 14, width: 1, height: 1 },
          { x: 16, y: 14, width: 1, height: 1 },
          { x: 1, y: 15, width: 7, height: 1 },
          { x: 14, y: 15, width: 2, height: 2 },
          { x: 17, y: 15, width: 3, height: 1 },
          { x: 1, y: 16, width: 1, height: 6 },
          { x: 7, y: 16, width: 1, height: 6 },
          { x: 10, y: 16, width: 1, height: 3 },
          { x: 12, y: 16, width: 4, height: 1 },
          { x: 18, y: 16, width: 2, height: 1 },
          { x: 3, y: 17, width: 3, height: 3 },
          { x: 10, y: 17, width: 3, height: 1 },
          { x: 15, y: 17, width: 1, height: 1 },
          { x: 19, y: 17, width: 3, height: 1 },
          { x: 9, y: 18, width: 2, height: 1 },
          { x: 14, y: 18, width: 1, height: 2 },
          { x: 17, y: 18, width: 2, height: 1 },
          { x: 20, y: 18, width: 1, height: 1 },
          { x: 9, y: 19, width: 1, height: 3 },
          { x: 11, y: 19, width: 2, height: 2 },
          { x: 17, y: 19, width: 1, height: 2 },
          { x: 19, y: 19, width: 1, height: 1 },
          { x: 9, y: 20, width: 5, height: 1 },
          { x: 15, y: 20, width: 1, height: 1 },
          { x: 17, y: 20, width: 2, height: 1 },
          { x: 21, y: 20, width: 1, height: 1 },
          { x: 1, y: 21, width: 7, height: 1 },
          { x: 9, y: 21, width: 2, height: 1 },
          { x: 12, y: 21, width: 2, height: 1 },
          { x: 16, y: 21, width: 1, height: 1 },
        ]),
      ).toMatchSnapshot();
    });

    it('should draw image if it is provided', () => {
      const qrCode = new QRCodeSVG('test', {
        image: {
          source: 'https://some-url.com/test.png',
          width: '10%',
          height: 20,
          x: 'center',
          y: 'bottom',
          border: '2',
        },
      });
      qrCode.getDataSize = vi.fn(() => 42);
      expect(
        qrCode._buildSVG([
          { x: 1, y: 1, width: 7, height: 1, id: 'i0' },
          { x: 9, y: 1, width: 2, height: 1, id: 'i5' },
        ]),
      ).toMatchSnapshot();
    });

    it('should build svg by relative rects', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getDataSize = vi.fn(() => 42);

      expect(
        qrCode._buildSVG([
          { x: 1, y: 1, width: 7, height: 1, id: 'i0' },
          { x: 9, y: 1, width: 2, height: 1, id: 'i5' },
          { x: 13, y: 1, width: 1, height: 3, id: 'i2' },
          { id: 'i0', x: 14, y: 0 },
          { x: 1, y: 2, width: 1, height: 6, id: 'i1' },
          { id: 'i1', x: 6, y: 0 },
          { x: 10, y: 2, width: 1, height: 1, id: 'i3' },
          { id: 'i1', x: 14, y: 0 },
          { id: 'i1', x: 20, y: 0 },
          { x: 3, y: 3, width: 3, height: 3, id: 'i4' },
          { id: 'i2', x: -4, y: 2 },
          { id: 'i3', x: 1, y: 1 },
          { id: 'i4', x: 14, y: 0 },
          { id: 'i3', x: 2, y: 2 },
          { x: 9, y: 5, width: 3, height: 1, id: 'i6' },
          { id: 'i0', x: 0, y: 6 },
          { id: 'i3', x: -1, y: 5 },
          { x: 11, y: 7, width: 1, height: 9 },
          { id: 'i3', x: 3, y: 5 },
          { id: 'i0', x: 14, y: 6 },
          { id: 'i5', x: 1, y: 7 },
          { x: 1, y: 9, width: 4, height: 1, id: 'i7' },
          { id: 'i3', x: -3, y: 7 },
          { id: 'i3', x: -1, y: 7 },
          { id: 'i3', x: 4, y: 7 },
          { id: 'i6', x: 8, y: 4 },
          { id: 'i2', x: 8, y: 8 },
          { id: 'i2', x: -12, y: 9 },
          { id: 'i6', x: -5, y: 5 },
          { id: 'i3', x: -2, y: 8 },
          { id: 'i2', x: 0, y: 9 },
          { x: 16, y: 10, width: 1, height: 2, id: 'i8' },
          { id: 'i5', x: 9, y: 9 },
          { id: 'i2', x: -10, y: 10 },
          { id: 'i6', x: -4, y: 6 },
          { x: 13, y: 11, width: 5, height: 1, id: 'ia' },
          { id: 'i5', x: 11, y: 10 },
          { id: 'i5', x: -6, y: 11 },
          { id: 'i5', x: -1, y: 11 },
          { id: 'i5', x: 4, y: 11 },
          { x: 18, y: 12, width: 1, height: 5 },
          { id: 'i2', x: 7, y: 11 },
          { id: 'i5', x: -7, y: 12 },
          { id: 'i3', x: -5, y: 11 },
          { id: 'i3', x: -3, y: 11 },
          { id: 'i6', x: 1, y: 8 },
          { x: 14, y: 13, width: 1, height: 4 },
          { id: 'i5', x: 8, y: 12 },
          { id: 'i3', x: -1, y: 12 },
          { id: 'i3', x: 6, y: 12 },
          { id: 'i0', x: 0, y: 14 },
          { x: 14, y: 15, width: 2, height: 2, id: 'i9' },
          { id: 'i6', x: 8, y: 10 },
          { id: 'i1', x: 0, y: 14 },
          { id: 'i1', x: 6, y: 14 },
          { id: 'i2', x: -3, y: 15 },
          { id: 'i7', x: 11, y: 7 },
          { id: 'i5', x: 9, y: 15 },
          { id: 'i4', x: 0, y: 14 },
          { id: 'i6', x: 1, y: 12 },
          { id: 'i3', x: 5, y: 15 },
          { id: 'i6', x: 10, y: 12 },
          { id: 'i5', x: 0, y: 17 },
          { id: 'i8', x: -2, y: 8 },
          { id: 'i5', x: 8, y: 17 },
          { id: 'i3', x: 10, y: 16 },
          { id: 'i2', x: -4, y: 18 },
          { id: 'i9', x: -3, y: 4 },
          { id: 'i8', x: 1, y: 9 },
          { id: 'i3', x: 9, y: 17 },
          { id: 'ia', x: -4, y: 9 },
          { id: 'i3', x: 5, y: 18 },
          { id: 'i5', x: 8, y: 19 },
          { id: 'i3', x: 11, y: 18 },
          { id: 'i0', x: 0, y: 20 },
          { id: 'i5', x: 0, y: 20 },
          { id: 'i5', x: 3, y: 20 },
          { id: 'i3', x: 6, y: 19 },
        ]),
      ).toMatchSnapshot();
    });
  });

  describe('toString', () => {
    it('should return null if data are empty', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode.toString()).toBeNull();
    });

    it('should return cached QR code', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode._buildSVG = vi.fn();
      qrCode.qrCodeSVG = '<svg><qrcode /></svg>';
      expect(qrCode.toString()).toEqual('<svg><qrcode /></svg>');
      expect(qrCode._buildSVG).not.toHaveBeenCalled();
    });

    it('should create QR code and return SVG', () => {
      const qrCode = new QRCodeSVG('test', {
        bgColor: '#DDD',
        fgColor: '#222',
      });
      expect(qrCode.toString()).toMatchSnapshot();
    });
  });

  describe('toDataUrl', () => {
    it('should return null if data are empty', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode.toDataUrl()).toBeNull();
    });

    it('should return cached QR code dataUrl', () => {
      const qrCode = new QRCodeSVG('test');
      qrCode._buildSVG = vi.fn();
      qrCode.qrCodeDataUrl = 'data:image/svg+xml;base64,<svg><qrcode /></svg>';
      expect(qrCode.toDataUrl()).toMatchSnapshot();
      expect(qrCode._buildSVG).not.toHaveBeenCalled();
    });

    it('should create QR code and return data source', () => {
      const qrCode = new QRCodeSVG('test', {
        bgColor: '#DDD',
        fgColor: '#222',
      });
      expect(qrCode.toDataUrl()).toMatchSnapshot();
    });
  });
});
