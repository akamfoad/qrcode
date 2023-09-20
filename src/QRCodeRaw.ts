import { QRCode as QRCodeCore, ErrorCorrectLevel } from '@akamfoad/qr';

export const ERROR_CORRECTION_LEVEL_LOW = 'L'; // Allows recovery of up to 7% data loss
export const ERROR_CORRECTION_LEVEL_MEDIUM = 'M'; // Allows recovery of up to 15% data loss
export const ERROR_CORRECTION_LEVEL_QUARTILE = 'Q'; // Allows recovery of up to 25% data loss
export const ERROR_CORRECTION_LEVEL_HIGH = 'H'; // Allows recovery of up to 30% data loss

export type ErrorCorrectionLevelType =
  | typeof ERROR_CORRECTION_LEVEL_LOW
  | typeof ERROR_CORRECTION_LEVEL_MEDIUM
  | typeof ERROR_CORRECTION_LEVEL_QUARTILE
  | typeof ERROR_CORRECTION_LEVEL_HIGH;

export type OptionsType = {
  level: ErrorCorrectionLevelType;
  typeNumber: number;
  padding: number;
  invert: boolean;
  errorsEnabled: boolean;
};

export type QRCodeDataType = boolean[][];

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
  level: ERROR_CORRECTION_LEVEL_LOW,
  padding: 1,
  invert: false,
  typeNumber: 0,
  errorsEnabled: false,
};

export default class QRCodeRaw {
  value: string;
  level: ErrorCorrectionLevelType;
  typeNumber: number;
  padding: number;
  errorsEnabled: boolean;
  invert: boolean;
  qrCodeData: QRCodeDataType | null | undefined;

  constructor(value: string, options: Partial<OptionsType> = {}) {
    const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

    this.value = value;
    this.level = params.level;
    this.typeNumber = params.typeNumber;
    this.padding = params.padding;
    this.invert = params.invert;
    this.errorsEnabled = params.errorsEnabled;
  }

  setValue(value: string): void {
    this.value = value;
    this._clearCache();
  }

  getDataSize(): number {
    const data = this.getData();
    return data ? data.length : 0;
  }

  _clearCache(): void {
    this.qrCodeData = null;
  }

  _getQrCodeData(modules: QRCodeDataType): QRCodeDataType {
    const qrCodeData: QRCodeDataType = [];

    const padding = this.padding;
    const invert = this.invert;
    const rowPadding = Array<boolean>(padding * 2 + modules.length).fill(
      invert,
    );
    const rowsPadding = Array<boolean[]>(padding).fill(rowPadding);
    const columnPadding = Array<boolean>(padding).fill(invert);

    if (padding) {
      qrCodeData.push(...rowsPadding);
    }
    modules.forEach((row: boolean[]) => {
      const qrCodeRow: boolean[] = [];
      qrCodeRow.push(
        ...columnPadding,
        ...row.map((isBlack) => (invert ? !isBlack : isBlack)),
        ...columnPadding,
      );
      qrCodeData.push(qrCodeRow);
    });
    if (padding) {
      qrCodeData.push(...rowsPadding);
    }

    return qrCodeData;
  }

  getData(): QRCodeDataType | null {
    if (!this.qrCodeData) {
      try {
        const qrcode = new QRCodeCore(
          this.typeNumber,
          ErrorCorrectLevel[this.level],
        );
        qrcode.addData(this.value);
        qrcode.make();
        if (!qrcode.modules) {
          return null;
        }
        // this.qrCodeData = this._getQrCodeData(qrcode.modules);
        this.qrCodeData = this._getQrCodeData(qrcode.modules as boolean[][]);
        Object.freeze(this.qrCodeData);
      } catch (error) {
        if (this.errorsEnabled) {
          throw error;
        }
        return null;
      }
    }
    return this.qrCodeData;
  }
}
