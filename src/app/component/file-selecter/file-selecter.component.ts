import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'file-selector',
  templateUrl: './file-selecter.component.html',
  styleUrls: ['./file-selecter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelecterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isAllowedEmpty: boolean = false;
  @Input() isViewAblePdf: boolean = false;

  get images(): ImageFile[] {
    return ImageStorage.instance.images;
  }
  get empty(): ImageFile {
    return ImageFile.Empty;
  }

  isViewFile(file: ImageFile): boolean {
    if (!this.isViewAblePdf && file?.blob?.type.match(/pdf/)) {
      return false;
    }
    return true;
  }

  getFileUrl(file: ImageFile): string {
    if (file.url.length <= 0) {
      return 'assets/images/loading.gif';
    }

    if (file?.blob?.type.match(/pdf/)) {
      console.log(file.name);
      return file.thumbnail.url;
    }

    return file.url;
  }

  constructor(private changeDetector: ChangeDetectorRef, private panelService: PanelService, private modalService: ModalService) {
    this.isAllowedEmpty = this.modalService.option && this.modalService.option.isAllowedEmpty ? true : false;
    if (this.modalService.option?.isViewAblePdf) {
      this.isViewAblePdf = true;
    }
  }

  ngOnInit() {
    Promise.resolve().then(() => (this.modalService.title = this.panelService.title = 'ファイル一覧'));
  }

  ngAfterViewInit() {
    EventSystem.register(this).on('SYNCHRONIZE_FILE_LIST', (event) => {
      if (event.isSendFromSelf) {
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onSelectedFile(file: ImageFile) {
    if (file.url.length <= 0) return;
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    this.modalService.resolve(file.identifier);
  }
}
