import { Injectable } from '@angular/core';
import { PdfFile } from '@udonarium/core/file-storage/pdf-file';
import { PdfStorage } from '@udonarium/core/file-storage/pdf-storage';

const mocPdf: PdfFile = PdfFile.create('./assets/pdf-test.pdf');

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  getSkeletonOr(pdf: PdfFile): PdfFile;
  getSkeletonOr(pdfIdentifier: string): PdfFile;
  getSkeletonOr(arg: any): PdfFile {
    let pdf: PdfFile = arg instanceof PdfFile ? arg : PdfStorage.instance.get(arg);
    return pdf && !pdf.isEmpty ? pdf : mocPdf;
  }

  getEmptyOr(pdf: PdfFile): PdfFile;
  getEmptyOr(pdfIdentifier: string): PdfFile;
  getEmptyOr(arg: any): PdfFile {
    let pdf: PdfFile = arg instanceof PdfFile ? arg : PdfStorage.instance.get(arg);
    return pdf && !pdf.isEmpty ? pdf : PdfFile.Empty;
  }
}
