import { EventSystem } from '../system';
import { ResettableTimeout } from '../system/util/resettable-timeout';
import { PdfContext, PdfFile, PdfState } from './pdf-file';

export type CatalogItem = { readonly identifier: string; readonly state: number };

export class PdfStorage {
  private static _instance: PdfStorage;
  static get instance(): PdfStorage {
    if (!PdfStorage._instance) PdfStorage._instance = new PdfStorage();
    return PdfStorage._instance;
  }

  private pdfHash: { [identifier: string]: PdfFile } = {};

  get pdfs(): PdfFile[] {
    let pdfs: PdfFile[] = [];
    for (let identifier in this.pdfHash) {
      pdfs.push(this.pdfHash[identifier]);
    }
    return pdfs;
  }

  private lazyTimer: ResettableTimeout;

  private constructor() {
    console.log('PdfStorage ready...');
  }

  private destroy() {
    for (let identifier in this.pdfHash) {
      this.delete(identifier);
    }
  }

  async addAsync(file: File): Promise<PdfFile>;
  async addAsync(blob: Blob): Promise<PdfFile>;
  async addAsync(arg: any): Promise<PdfFile> {
    let pdf: PdfFile = await PdfFile.createAsync(arg);

    return this._add(pdf);
  }

  add(url: string): PdfFile;
  add(pdf: PdfFile): PdfFile;
  add(context: PdfContext): PdfFile;
  add(arg: any): PdfFile {
    let pdf: PdfFile;
    if (typeof arg === 'string') {
      pdf = PdfFile.create(arg);
    } else if (arg instanceof PdfFile) {
      pdf = arg;
    } else {
      if (this.update(arg)) return this.pdfHash[arg.identifier];
      pdf = PdfFile.create(arg);
    }
    return this._add(pdf);
  }

  private _add(pdf: PdfFile): PdfFile {
    if (PdfState.COMPLETE <= pdf.state) this.lazySynchronize(100);
    if (this.update(pdf)) return this.pdfHash[pdf.identifier];
    this.pdfHash[pdf.identifier] = pdf;

    return pdf;
  }

  private update(pdf: PdfFile): boolean;
  private update(pdf: PdfContext): boolean;
  private update(pdf: any): boolean {
    let context: PdfContext;
    if (pdf instanceof PdfFile) {
      context = pdf.toContext();
    } else {
      context = pdf;
    }
    let updatingPdf: PdfFile = this.pdfHash[pdf.identifier];
    if (updatingPdf) {
      updatingPdf.apply(pdf);
      return true;
    }
    return false;
  }

  delete(identifier: string): boolean {
    let deletePdf: PdfFile = this.pdfHash[identifier];
    if (deletePdf) {
      deletePdf.destroy();
      delete this.pdfHash[identifier];
      return true;
    }
    return false;
  }

  get(identifier: string): PdfFile {
    let pdf: PdfFile = this.pdfHash[identifier];
    if (pdf) return pdf;
    return null;
  }

  synchronize(peer?: string) {
    if (this.lazyTimer) this.lazyTimer.stop();
    //EventSystem.call('SYNCHRONIZE_PDF_FILE_LIST', this.getCatalog(), peer);
  }

  lazySynchronize(ms: number, peer?: string) {
    if (this.lazyTimer == null) this.lazyTimer = new ResettableTimeout(() => this.synchronize(peer), ms);
    this.lazyTimer.reset(ms);
  }

  getCatalog(): CatalogItem[] {
    let catalog: CatalogItem[] = [];
    for (let pdf of this.pdfs) {
      if (PdfState.COMPLETE <= pdf.state) {
        catalog.push({ identifier: pdf.identifier, state: pdf.state });
      }
    }
    return catalog;
  }
}
