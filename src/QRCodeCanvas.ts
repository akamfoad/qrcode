import type { QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './utils/ColorUtils';
import type {
  ImageConfigType,
  OptionsType as ParentOptionsType,
} from './AbstractQRCodeWithImage';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';
import { loadImage } from './loader/ImageLoader';

export type OptionsType = ParentOptionsType & {
  fgColor?: string;
  bgColor?: string;
  scale?: number;
  size?: number;
};

const DEFAULT_OPTIONS = {
  fgColor: '#000',
  bgColor: '#FFF',
  scale: 10,
  size: null,
};

export default class QRCodeCanvas extends AbstractQRCodeWithImage {
  fgColor: string;
  bgColor: string;
  scale: number;
  size: number | null;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  constructor(value: string, options: Partial<OptionsType> = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS, ...options };

    this.fgColor = params.fgColor;
    this.bgColor = params.bgColor;
    this.scale = params.scale;
    this.size = params.size;

    this.canvas = document.createElement('canvas');
    // Added by me
    const canvasContext = this.canvas.getContext('2d');
    if (canvasContext === null) {
      throw new Error('canvas context is null');
    }
    this.canvasContext = canvasContext;

    // this.toDataURL = this.toDataUrl;
  }

  _clearCache(): void {
    super._clearCache();
    this.canvas.width = 0;
  }

  _getCanvasSize(): number | null {
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }
    if (this.size) {
      return this.size;
    }
    if (this.scale) {
      return this.scale * dataSize;
    }
    return dataSize;
  }

  draw(
    canvas: HTMLCanvasElement | null = null,
  ): null | HTMLCanvasElement | Promise<HTMLCanvasElement> {
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }

    const data: QRCodeDataType | null = this.getData();
    if (!data) {
      return null;
    }

    const fgColor = ColorUtils.convertHexColorToBytes(this.fgColor);
    const bgColor = ColorUtils.convertHexColorToBytes(this.bgColor);

    let index = 0;
    const bytes = new Uint8ClampedArray(dataSize ** 2 * 4);
    data.forEach((row: boolean[]) => {
      row.forEach((isBlack: boolean) => {
        if (isBlack) {
          bytes.set(fgColor, index);
        } else {
          bytes.set(bgColor, index);
        }
        index += 4;
      });
    });

    const imageData = new ImageData(bytes, dataSize, dataSize);

    this.canvas.width = dataSize;
    this.canvas.height = dataSize;
    this.canvasContext.putImageData(imageData, 0, 0);

    const canvasSize = this._getCanvasSize();

    const qrCodeCanvas = canvas || document.createElement('canvas');
    // @ts-expect-error make types stronger
    qrCodeCanvas.width = canvasSize;
    // @ts-expect-error make types stronger
    qrCodeCanvas.height = canvasSize;

    const qrCodeCanvasContext = qrCodeCanvas.getContext('2d');
    // @ts-expect-error make types stronger
    qrCodeCanvasContext.imageSmoothingEnabled = false;
    // @ts-expect-error make types stronger
    qrCodeCanvasContext.drawImage(this.canvas, 0, 0, canvasSize, canvasSize);

    const drawImageResult = this._drawImage(
      // @ts-expect-error make types stronger
      qrCodeCanvasContext,
      // @ts-expect-error make types stronger
      canvasSize / dataSize,
    );
    if (drawImageResult instanceof Promise) {
      return drawImageResult.then(() => {
        return qrCodeCanvas;
      });
    }
    return qrCodeCanvas;
  }

  // @ts-expect-error make types stronger
  _getImageSource(
    imageConfig: ImageConfigType,
  ): null | typeof Image | HTMLCanvasElement | Promise<unknown> {
    const source = imageConfig.source;
    if (typeof source === 'string') {
      // @ts-expect-error make types stronger
      return loadImage(source).then((image: typeof Image) => {
        // @ts-expect-error make types stronger
        this.image.source = image;
        imageConfig.source = image;
        return image;
      });
    }
    if (source instanceof Image) {
      return source;
    }
    if (source instanceof HTMLCanvasElement) {
      return source;
    }
    return null;
  }

  _drawImage(
    qrCodeCanvasContext: HTMLCanvasElement,
    pixelSize: number,
  ): null | true | Promise<unknown> {
    // @ts-expect-error make types stronger
    const imageConfig: ImageConfigType = this._getImageConfig();
    if (!imageConfig) {
      return null;
    }

    if (imageConfig.source instanceof Promise) {
      // @ts-expect-error make types stronger
      return imageConfig.source.then((image: typeof Image) => {
        // @ts-expect-error make types stronger
        qrCodeCanvasContext.drawImage(
          image,
          // @ts-expect-error make types stronger
          imageConfig.x * pixelSize,
          // @ts-expect-error make types stronger
          imageConfig.y * pixelSize,
          // @ts-expect-error make types stronger
          imageConfig.width * pixelSize,
          // @ts-expect-error make types stronger
          imageConfig.height * pixelSize,
        );
      });
    }

    // @ts-expect-error make types stronger
    qrCodeCanvasContext.drawImage(
      imageConfig.source,
      // @ts-expect-error make types stronger
      imageConfig.x * pixelSize,
      // @ts-expect-error make types stronger
      imageConfig.y * pixelSize,
      // @ts-expect-error make types stronger
      imageConfig.width * pixelSize,
      // @ts-expect-error make types stronger
      imageConfig.height * pixelSize,
    );

    return true;
  }

  getCanvas(): null | HTMLCanvasElement | Promise<unknown> {
    return this.draw();
  }

  toDataUrl(
    type: string = 'image/png',
    encoderOptions: number = 0.92,
  ): null | string | Promise<unknown> {
    const canvasOrPromise = this.draw();
    if (!canvasOrPromise) {
      return null;
    }
    if (canvasOrPromise instanceof Promise) {
      return canvasOrPromise.then((qrCodeCanvas) => {
        return qrCodeCanvas.toDataURL(type, encoderOptions);
      });
    }
    return canvasOrPromise.toDataURL(type, encoderOptions);
  }
}
