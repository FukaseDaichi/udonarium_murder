import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';
import { kdf } from 'crypto-js';
import { ModalService } from 'service/modal.service';

import { PanelService } from 'service/panel.service';

@Component({
  selector: 'file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileStorageComponent implements OnInit, OnDestroy, AfterViewInit {
  fileStorageService = ImageStorage.instance;
  constructor(private changeDetector: ChangeDetectorRef, private panelService: PanelService) {}

  @Input() isViewAblePdf: boolean = true;

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

  ngOnInit() {
    Promise.resolve().then(() => {
      this.panelService.title = 'ファイル一覧';
      if (this.panelService?.className === 'isViewAblePdf') {
        this.isViewAblePdf = true;
      }
    });
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

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  onSelectedFile(file: ImageFile) {
    if (file.url.length <= 0) return;
    console.log('onSelectedFile', file);
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
  }
}
