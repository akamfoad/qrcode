import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

export type ImageConfigType = {
    source: string | typeof Image | HTMLCanvasElement | Promise<any>,
    width: number | string, // 20 | 20%
    height: number | string, // 20 | 20%
    x: number | string, // 20 | 20% | center | left 20% | right 20%
    y: number | string, // 20 | 20% | center | top 20% | bottom 20%,
    border: number|null,
};

export type OptionsType = ParentOptionsType & {
    image?: ImageConfigType,
}

const DEFAULT_OPTIONS = {
    image: null,
};

const DEFAULT_IMAGE_BORDER = 1;

export default class AbstractQRCodeWithImage extends QRCodeRaw {

    image: ImageConfigType|null = null;
    imageConfig: ImageConfigType|null = null;

    constructor(value: string, options: Partial<OptionsType> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };
        this.image = params.image;
    }

    _clearCache(): void {
        super._clearCache();
        this.imageConfig = null;
    }

    _getImageSource(imageConfig: ImageConfigType): string|null {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return source;
        }
        if (source instanceof Image) {
            return source.src;
        }
        if (source instanceof HTMLCanvasElement) {
            return source.toDataURL();
        }
        return null;
    }

    _getImageConfig(): ImageConfigType|null {
        if (this.imageConfig) {
            return this.imageConfig;
        }
        if (!this.image || !this.image.source || !this.image.width || !this.image.height) {
            return null;
        }
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        const source = this._getImageSource(this.image);
        if (!source) {
            return null;
        }

        const dataSizeWithoutPadding = dataSize - this.padding * 2;
        const width = DimensionUtils.calculateDimension(this.image.width, dataSizeWithoutPadding);
        const height = DimensionUtils.calculateDimension(this.image.height, dataSizeWithoutPadding);
        const x = DimensionUtils.calculatePosition(this.image.x, width, dataSizeWithoutPadding) + this.padding;
        const y = DimensionUtils.calculatePosition(this.image.y, height, dataSizeWithoutPadding) + this.padding;

        let border:number|null = DEFAULT_IMAGE_BORDER;
        if (typeof this.image.border === 'number' || this.image.border === null) {
            border = this.image.border;
        }

        this.imageConfig = { source, border, x, y, width, height };
        return this.imageConfig;
    }

    getData(): QRCodeDataType|null {
        if (this.qrCodeData) {
            return this.qrCodeData;
        }

        const data = super.getData();
        if (!data) {
            return data;
        }

        // FIXME better handle string and number types
        // @ts-expect-error
        const imageConfig: ImageConfigType = this._getImageConfig();
        if (imageConfig !== null && imageConfig.width && imageConfig.height) {
            if (typeof imageConfig.border === 'number') {
                // @ts-expect-error
                const begX = Math.max(imageConfig.x - imageConfig.border, 0);
                // @ts-expect-error
                const begY = Math.max(imageConfig.y - imageConfig.border, 0);
                // @ts-expect-error
                const endX = Math.min(begX + imageConfig.width + imageConfig.border * 2, data.length);
                // @ts-expect-error
                const endY = Math.min(begY + imageConfig.height + imageConfig.border * 2, data.length);
                for (let y = begY; y < endY; y += 1) {
                    for (let x = begX; x < endX; x += 1) {
                        data[y][x] = this.invert ? true : false;
                    }
                }
            }
        }

        return data;
    }

}
