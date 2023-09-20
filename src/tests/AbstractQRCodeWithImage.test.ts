import { beforeEach, describe, expect, it, vi } from 'vitest';

import AbstractQRCodeWithImage from '../AbstractQRCodeWithImage';

const initialMockedQRCode = {
  addData: vi.fn(),
  make: vi.fn(),
  modules: [
    [true, true, true, true, true],
    [true, false, false, false, true],
    [true, false, true, false, true],
    [true, false, false, false, true],
    [true, true, true, true, true],
  ],
};
let mockedQRCode = { ...initialMockedQRCode };

beforeEach(() => {
  mockedQRCode = { ...initialMockedQRCode };
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

// FIXME fix reported issues

describe('AbstractQRCodeWithImage', () => {
  describe('constructor', () => {
    it('should use default params if nothing is provided', () => {
      // @ts-expect-error testing no argument passed
      const qrCode = new AbstractQRCodeWithImage();
      expect(qrCode.value).toBeUndefined();
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('L');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
      expect(qrCode.image).toBeNull();
    });

    it('should default params for not specified params', () => {
      const qrCode = new AbstractQRCodeWithImage('test 42', {
        level: 'Q',
      });
      expect(qrCode.value).toEqual('test 42');
      expect(qrCode.padding).toEqual(1);
      expect(qrCode.level).toEqual('Q');
      expect(qrCode.typeNumber).toEqual(0);
      expect(qrCode.errorsEnabled).toBeFalsy();
      expect(qrCode.invert).toBeFalsy();
      expect(qrCode.image).toBeNull();
    });

    it('should use specified params', () => {
      const qrCode = new AbstractQRCodeWithImage('test 84', {
        level: 'H',
        padding: 0,
        typeNumber: 20,
        invert: true,
        errorsEnabled: true,
        image: {
          source: 'some-url.png',
          width: 100,
          height: 100,
        },
      });
      expect(qrCode.value).toEqual('test 84');
      expect(qrCode.padding).toEqual(0);
      expect(qrCode.level).toEqual('H');
      expect(qrCode.typeNumber).toEqual(20);
      expect(qrCode.errorsEnabled).toBeTruthy();
      expect(qrCode.invert).toBeTruthy();
      expect(qrCode.image).toEqual({
        source: 'some-url.png',
        width: 100,
        height: 100,
      });
    });
  });

  describe('_clearCache', () => {
    it('should clear qrCodeData and qrCodeText', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      qrCode.imageConfig = {
        source: 'some-url.png',
        width: 100,
        height: 100,
      };
      qrCode._clearCache();
      expect(qrCode.imageConfig).toBeNull();
    });
  });

  describe('_getImageSource', () => {
    it('should return string if string is passed', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      expect(qrCode._getImageSource({ source: 'foo-bar.png' })).toEqual(
        'foo-bar.png',
      );
    });

    it('should return Image.src if Image is passed', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      const img = new Image();
      img.src = 'https://some-url.com/foo.png';
      expect(qrCode._getImageSource({ source: img })).toEqual(
        'https://some-url.com/foo.png',
      );
    });

    it('should return Canvas.toDataUrl if Canvas is passed', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      const canvas = document.createElement('canvas');
      canvas.toDataURL = vi.fn(() => 'data:foo-bar');
      expect(qrCode._getImageSource({ source: canvas })).toEqual(
        'data:foo-bar',
      );
      expect(canvas.toDataURL).toHaveBeenCalled();
    });

    it('should return null if source has wrong type', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      expect(qrCode._getImageSource({ source: true })).toEqual(null);
      expect(qrCode._getImageSource({ source: 42 })).toEqual(null);
      expect(qrCode._getImageSource({ source: undefined })).toEqual(null);
      expect(qrCode._getImageSource({ source: null })).toEqual(null);
    });
  });

  const buildInstance = () => {
    const qrCode = new AbstractQRCodeWithImage('test', {
      padding: 0,
      image: {
        source: 'https://someurl.com/img.png',
        width: 10,
        height: 10,
        border: 0,
        x: 0,
        y: 0,
      },
    });
    qrCode.getDataSize = vi.fn(() => 42);

    return qrCode;
  };

  describe('_getImageConfig', () => {
    it('should return cached imageConfig', () => {
      const qrCode = buildInstance();
      qrCode.imageConfig = { foo: 'bar' };
      expect(qrCode._getImageConfig()).toEqual({ foo: 'bar' });
    });

    it('should return null if image is not provided', () => {
      const qrCode = buildInstance();

      qrCode.image = null;
      expect(qrCode._getImageConfig()).toBeNull();
    });

    it('should return null if image.source is not provided', () => {
      const qrCode = buildInstance();

      qrCode.image.source = null;
      expect(qrCode._getImageConfig()).toBeNull();
    });

    it('should return null if image.width is not provided', () => {
      const qrCode = buildInstance();

      qrCode.image.width = null;
      expect(qrCode._getImageConfig()).toBeNull();
    });

    it('should return null if image.height is not provided', () => {
      const qrCode = buildInstance();

      qrCode.image.height = null;
      expect(qrCode._getImageConfig()).toBeNull();
    });

    it('should return null if dataSize is empty', () => {
      const qrCode = buildInstance();

      qrCode.getDataSize = vi.fn(() => 0);
      expect(qrCode._getImageConfig()).toBeNull();
    });

    it('should return imageConfig if dataSize is empty', () => {
      const qrCode = buildInstance();

      expect(qrCode._getImageConfig()).toEqual({
        source: 'https://someurl.com/img.png',
        border: 0,
        width: 10,
        height: 10,
        x: 0,
        y: 0,
      });
    });

    it('should return increase X & Y on padding size', () => {
      const qrCode = buildInstance();

      qrCode.padding = 4;
      expect(qrCode._getImageConfig()).toEqual({
        source: 'https://someurl.com/img.png',
        border: 0,
        width: 10,
        height: 10,
        x: 4,
        y: 4,
      });

      qrCode.imageConfig = null;
      qrCode.image.x = 'right';
      qrCode.image.y = 'center';
      expect(qrCode._getImageConfig()).toEqual({
        source: 'https://someurl.com/img.png',
        border: 0,
        width: 10,
        height: 10,
        x: 28,
        y: 16,
      });
    });

    it('should calculate width and height without padding', () => {
      const qrCode = buildInstance();

      qrCode.padding = 5;
      qrCode.image.width = '100%';
      qrCode.image.height = '50%';
      expect(qrCode._getImageConfig()).toEqual({
        source: 'https://someurl.com/img.png',
        border: 0,
        width: 32,
        height: 16,
        x: 5,
        y: 5,
      });
    });
  });

  describe('getData', () => {
    it('should not change data if image is not provided', () => {
      const qrCode = new AbstractQRCodeWithImage('test');
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, true, false, true, false],
        [false, true, false, false, false, true, false],
        [false, true, true, true, true, true, false],
        [false, false, false, false, false, false, false],
      ]);
    });

    it('should not change data if image.border is not number', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'center',
          y: 'center',
          width: 5,
          height: 5,
          border: null,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, true, false, true, false],
        [false, true, false, false, false, true, false],
        [false, true, true, true, true, true, false],
        [false, false, false, false, false, false, false],
      ]);
    });

    it('should remove data under image if image.border is 0', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'right',
          y: 'bottom',
          width: 3,
          height: 2,
          border: 0,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, true, false, true, false],
        [false, true, false, false, false, false, false],
        [false, true, true, false, false, false, false],
        [false, false, false, false, false, false, false],
      ]);
      expect(qrCode.imageConfig).toEqual({
        source: 'foo.png',
        x: 3,
        y: 4,
        width: 3,
        height: 2,
        border: 0,
      });
    });

    it('should remove data under image and border if image.border is greater than 0', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'right',
          y: 'bottom',
          width: 3,
          height: 2,
          border: 1,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, false, false, false, false, false, false],
      ]);
      expect(qrCode.imageConfig).toEqual({
        source: 'foo.png',
        x: 3,
        y: 4,
        width: 3,
        height: 2,
        border: 1,
      });
    });

    it('should use default border = 1if image.border is not provided', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'right',
          y: 'bottom',
          width: 3,
          height: 2,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, false, false, false, false, false, false],
      ]);
      expect(qrCode.imageConfig).toEqual({
        source: 'foo.png',
        x: 3,
        y: 4,
        width: 3,
        height: 2,
        border: 1,
      });
    });

    it('should remove data under image and min border if image.border is less than 0', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'center',
          y: 'center',
          width: 5,
          height: 5,
          border: -1,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, true, true, true, true, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, false, false, true, false],
        [false, true, false, false, false, true, false],
        [false, true, true, true, true, true, false],
        [false, false, false, false, false, false, false],
      ]);
      expect(qrCode.imageConfig).toEqual({
        source: 'foo.png',
        x: 1,
        y: 1,
        width: 5,
        height: 5,
        border: -1,
      });
    });

    it('should calculate well inverted data', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        invert: true,
        image: {
          source: 'foo.png',
          x: 'right',
          y: 'bottom',
          width: 3,
          height: 2,
          border: 0,
        },
      });
      expect(qrCode.getData()).toEqual([
        [true, true, true, true, true, true, true],
        [true, false, false, false, false, false, true],
        [true, false, true, true, true, false, true],
        [true, false, true, false, true, false, true],
        [true, false, true, true, true, true, true],
        [true, false, false, true, true, true, true],
        [true, true, true, true, true, true, true],
      ]);
      expect(qrCode.imageConfig).toEqual({
        source: 'foo.png',
        x: 3,
        y: 4,
        width: 3,
        height: 2,
        border: 0,
      });
    });

    it('should calculate well large border', () => {
      const qrCode = new AbstractQRCodeWithImage('test', {
        image: {
          source: 'foo.png',
          x: 'center',
          y: 'center',
          width: 1,
          height: 1,
          border: 100,
        },
      });
      expect(qrCode.getData()).toEqual([
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
      ]);
    });
  });
});
