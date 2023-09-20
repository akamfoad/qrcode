import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadImage } from '../loader/ImageLoader';

const GlobalImage = global.Image;

describe('loadImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('return should be a promise', () => {
    expect(loadImage('http://localhost:3000')).toBeInstanceOf(Promise);
  });

  it('return should resolve to an Image', async () => {
    let instance: HTMLImageElement = new GlobalImage();

    class ImageMock extends GlobalImage {
      constructor(width?: number, height?: number) {
        super(width, height);
        instance = this.getInstance();
      }

      getInstance = () => {
        return this;
      };
    }

    vi.stubGlobal('Image', ImageMock);

    const result = loadImage('http://localhost:3000');

    instance.onload?.(new Event('load'));

    expect(await result).toBeInstanceOf(GlobalImage);
  });

  it('return should reject to an Image', async () => {
    let instance: HTMLImageElement = new GlobalImage();

    class ImageMock extends GlobalImage {
      constructor(width?: number, height?: number) {
        super(width, height);
        instance = this.getInstance();
      }

      getInstance = () => {
        return this;
      };
    }

    vi.stubGlobal('Image', ImageMock);

    try {
      const image = loadImage('http://localhost:3000');

      instance.onerror?.(new Event('error'));

      await image;
    } catch (img) {
      expect(img).toBeInstanceOf(GlobalImage);
    }
  });
});
