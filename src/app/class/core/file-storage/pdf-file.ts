import { FileReaderUtil } from './file-reader-util';

export enum PdfState {
  NULL = 0,
  THUMBNAIL = 1,
  COMPLETE = 2,
  URL = 1000,
}

export interface PdfContext {
  identifier: string;
  name: string;
  type: string;
  blob: Blob;
  url: string;
  thumbnail: ThumbnailContext;
}

export interface ThumbnailContext {
  type: string;
  blob: Blob;
  url: string;
}

export class PdfFile {
  private context: PdfContext = {
    identifier: '',
    name: '',
    blob: null,
    type: '',
    url: '',
    thumbnail: {
      blob: null,
      type: '',
      url: '',
    },
  };

  get identifier(): string {
    return this.context.identifier;
  }
  get name(): string {
    return this.context.name;
  }
  get blob(): Blob {
    return this.context.blob ? this.context.blob : this.context.thumbnail.blob;
  }
  get url(): string {
    return this.context.url ? this.context.url : this.context.thumbnail.url;
  }
  get thumbnail(): ThumbnailContext {
    return this.context.thumbnail;
  }

  get state(): PdfState {
    if (!this.url && !this.blob) return PdfState.NULL;
    if (this.url && !this.blob) return PdfState.URL;
    if (this.blob === this.thumbnail.blob) return PdfState.THUMBNAIL;
    return PdfState.COMPLETE;
  }

  get isEmpty(): boolean {
    return this.state <= PdfState.NULL;
  }

  private constructor() {}

  static createEmpty(identifier: string): PdfFile {
    let pdfFile = new PdfFile();
    pdfFile.context.identifier = identifier;

    return pdfFile;
  }

  static create(url: string): PdfFile;
  static create(context: PdfContext): PdfFile;
  static create(arg: any): PdfFile {
    if (typeof arg === 'string') {
      let pdfFile = new PdfFile();
      pdfFile.context.identifier = arg;
      pdfFile.context.name = arg;
      pdfFile.context.url = arg;
      return pdfFile;
    } else {
      let pdfFile = new PdfFile();
      pdfFile.apply(arg);
      return pdfFile;
    }
  }

  static async createAsync(file: File): Promise<PdfFile>;
  static async createAsync(blob: Blob): Promise<PdfFile>;
  static async createAsync(arg: any): Promise<PdfFile> {
    if (arg instanceof File) {
      return await PdfFile._createAsync(arg, arg.name);
    } else if (arg instanceof Blob) {
      return await PdfFile._createAsync(arg);
    }
  }

  private static async _createAsync(blob: Blob, name?: string): Promise<PdfFile> {
    let arrayBuffer = await FileReaderUtil.readAsArrayBufferAsync(blob);

    let pdfFile = new PdfFile();
    pdfFile.context.identifier = await FileReaderUtil.calcSHA256Async(arrayBuffer);
    pdfFile.context.name = name;
    pdfFile.context.blob = new Blob([arrayBuffer], { type: blob.type });
    pdfFile.context.url = window.URL.createObjectURL(pdfFile.context.blob);

    if (pdfFile.context.name != null) pdfFile.context.name = pdfFile.context.identifier;

    return pdfFile;
  }

  destroy() {
    this.revokeURLs();
  }

  apply(context: PdfContext) {
    if (!this.context.identifier && context.identifier) this.context.identifier = context.identifier;
    if (!this.context.name && context.name) this.context.name = context.name;
    if (!this.context.blob && context.blob) this.context.blob = context.blob;
    if (!this.context.type && context.type) this.context.type = context.type;
    if (!this.context.url && context.url) {
      if (this.state !== PdfState.URL) window.URL.revokeObjectURL(this.context.url);
      this.context.url = context.url;
    }
    if (!this.context.thumbnail.blob && context.thumbnail.blob) this.context.thumbnail.blob = context.thumbnail.blob;
    if (!this.context.thumbnail.type && context.thumbnail.type) this.context.thumbnail.type = context.thumbnail.type;
    if (!this.context.thumbnail.url && context.thumbnail.url) {
      if (this.state !== PdfState.URL) window.URL.revokeObjectURL(this.context.thumbnail.url);
      this.context.thumbnail.url = context.thumbnail.url;
    }
    this.createURLs();
  }

  toContext(): PdfContext {
    return {
      identifier: this.context.identifier,
      name: this.context.name,
      blob: this.context.blob,
      type: this.context.type,
      url: this.context.url,
      thumbnail: {
        blob: this.context.thumbnail.blob,
        type: this.context.thumbnail.type,
        url: this.context.thumbnail.url,
      },
    };
  }

  private createURLs() {
    if (this.state === PdfState.URL) return;
    if (this.context.blob && this.context.url === '') this.context.url = window.URL.createObjectURL(this.context.blob);
    if (this.context.thumbnail.blob && this.context.thumbnail.url === '') this.context.thumbnail.url = window.URL.createObjectURL(this.context.thumbnail.blob);
  }

  private revokeURLs() {
    if (this.state === PdfState.URL) return;
    window.URL.revokeObjectURL(this.context.url);
    window.URL.revokeObjectURL(this.context.thumbnail.url);
  }

  static Empty: PdfFile = PdfFile.createEmpty('null');
}
