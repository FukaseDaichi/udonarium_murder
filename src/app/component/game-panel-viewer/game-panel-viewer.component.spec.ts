import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageFile } from '@udonarium/core/file-storage/image-file';

import { GamePanelViewerComponent } from './game-panel-viewer.component';

@Component({
  selector: 'pdf-viewer',
  template: '',
})
class PdfViewerStubComponent {
  @Input() src: string = '';
  @Input('original-size') originalSize: boolean = true;
  @Input() autoresize: boolean = false;
}

describe('GamePanelViewerComponent', () => {
  let component: GamePanelViewerComponent;
  let fixture: ComponentFixture<GamePanelViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamePanelViewerComponent, PdfViewerStubComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePanelViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns an empty PDF source until the file input is set', () => {
    component.pdfFile = null;

    expect(component.pdfSrc).toBe('');
  });

  it('returns the PDF file URL', () => {
    component.pdfFile = ImageFile.create('https://example.com/panel.pdf');

    expect(component.pdfSrc).toBe('https://example.com/panel.pdf');
  });
});
