import { beforeEach, describe, expect, it, vi } from 'vitest';

import QRCodeRaw from '../QRCodeRaw';

let mockedQRCode = { addData: vi.fn(), make: vi.fn(), modules: [[true]] };

beforeEach(() => {
  mockedQRCode = { addData: vi.fn(), make: vi.fn(), modules: [[true]] };
});

vi.mock('@akamfoad/qr', async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...(mod || {}),
    QRCode: function () {
      Object.assign(this, mockedQRCode);
    },
  };
});

describe('QRCodeRaw', () => {
  describe('constructor', () => {
    it('should use default params if nothing is provided', () => {
      // @ts-expect-error checking undefined
      const qrCode = new QRCodeRaw();
      expect(qrCode.value).toBeUndefined();
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('L');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
    });

    it('should default params for not specified params', () => {
      const qrCode = new QRCodeRaw('test 42', { level: 'Q' });
      expect(qrCode.value).toEqual('test 42');
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('Q');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
    });

    it('should use specified params', () => {
      const qrCode = new QRCodeRaw('test 84', {
        level: 'H',
        padding: 0,
        typeNumber: 20,
        invert: true,
        errorsEnabled: true,
      });
      expect(qrCode.value).toEqual('test 84');
      expect(qrCode.padding).toEqual(0);
      expect(qrCode.level).toEqual('H');
      expect(qrCode.typeNumber).toEqual(20);
      expect(qrCode.errorsEnabled).toBeTruthy();
      expect(qrCode.invert).toBeTruthy();
    });
  });

  describe('setValue', () => {
    it('should set new value and clear cache', () => {
      const qrCode = new QRCodeRaw('test');
      qrCode._clearCache = vi.fn();

      qrCode.setValue('foo 42');
      expect(qrCode.value).toEqual('foo 42');
      expect(qrCode._clearCache).toHaveBeenCalled();
    });
  });

  describe('getDataSize', () => {
    it('should return 0 if data is empty', () => {
      const qrCode = new QRCodeRaw('test');
      qrCode.getData = vi.fn(() => null);
      expect(qrCode.getDataSize()).toEqual(0);
    });

    it('should return length of data', () => {
      const qrCode = new QRCodeRaw('test');
      qrCode.getData = vi.fn(() => [[true], [false], [true], [false]]);
      expect(qrCode.getDataSize()).toEqual(4);
    });
  });

  describe('_clearCache', () => {
    it('should clear qrCodeData', () => {
      const qrCode = new QRCodeRaw('test');
      qrCode.qrCodeData = [[true], [false], [true], [false]];
      qrCode._clearCache();
      expect(qrCode.qrCodeData).toBeNull();
    });
  });

  describe('_getQrCodeData', () => {
    it('should return deep cloned arrays', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      const source = [
        [true, true, true],
        [true, false, true],
        [true, true, true],
      ];
      const result = qrCode._getQrCodeData(source);
      expect(result).toEqual(source);
      expect(result).not.toBe(source);
      source[1][1] = true;
      expect(result).not.toEqual(source);
    });

    it('should invert data if the param is enabled', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      const source = [
        [false, true, true],
        [true, false, true],
        [false, true, true],
      ];
      qrCode.invert = true;
      const result = qrCode._getQrCodeData(source);
      expect(result).toEqual([
        [true, false, false],
        [false, true, false],
        [true, false, false],
      ]);
    });

    it('should add padding to data', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      const source = [
        [false, true, true],
        [true, false, true],
        [false, true, true],
      ];
      qrCode.padding = 1;
      expect(qrCode._getQrCodeData(source)).toEqual([
        [false, false, false, false, false],
        [false, false, true, true, false],
        [false, true, false, true, false],
        [false, false, true, true, false],
        [false, false, false, false, false],
      ]);

      qrCode.padding = 3;
      expect(qrCode._getQrCodeData(source)).toEqual([
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, true, true, false, false, false],
        [false, false, false, true, false, true, false, false, false],
        [false, false, false, false, true, true, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
      ]);
    });

    it('should invert data with padding', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      const source = [
        [false, true, true],
        [true, false, true],
        [false, true, true],
      ];

      qrCode.invert = true;
      qrCode.padding = 3;
      expect(qrCode._getQrCodeData(source)).toEqual([
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, false, false, true, true, true],
        [true, true, true, false, true, false, true, true, true],
        [true, true, true, true, false, false, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
      ]);
    });
  });

  describe('getData', () => {
    it('should return cached data', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });
      qrCode.qrCodeData = [[true], [false], [true], [false]];
      expect(qrCode.getData()).toEqual([[true], [false], [true], [false]]);
    });

    it('should throw an error on error if errorsEnable is true', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0, errorsEnabled: true });

      mockedQRCode.addData = vi.fn().mockImplementation(() => {
        throw new Error('');
      });

      expect(() => qrCode.getData()).toThrowError();
    });

    it('should return null on error if errorsEnable is false', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      mockedQRCode.addData = vi.fn().mockImplementation(() => {
        throw new Error('');
      });

      expect(qrCode.getData()).toBeNull();
    });

    it('should return data of QR code', () => {
      const qrCode = new QRCodeRaw('test', { padding: 0 });

      mockedQRCode.modules = [
        [true, true, true],
        [true, false, true],
        [true, true, true],
      ];

      expect(qrCode.getData()).toEqual([
        [true, true, true],
        [true, false, true],
        [true, true, true],
      ]);
    });
  });
});
