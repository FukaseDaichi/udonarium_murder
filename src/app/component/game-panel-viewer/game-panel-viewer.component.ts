import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';
import { GamePanelService } from 'service/game-panel.service';
import { ImageService } from 'service/image.service';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'game-panel-viewer',
  templateUrl: './game-panel-viewer.component.html',
  styleUrls: ['./game-panel-viewer.component.css'],
})
export class GamePanelViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gamePanel: GamePanel = null;

  @Input() pdfFile: ImageFile = null;

  get pdfSrc() {
    return this.pdfFile.url;
  }

  constructor(private modalService: ModalService, private gamePanelService: GamePanelService, private imageService: ImageService) {}

  toggleFullScreen() {}
  close() {
    if (this.gamePanelService) this.gamePanelService.close();
  }
  ngOnInit() {
    this.gamePanel = ObjectStore.instance.get<GamePanel>(this.gamePanelService.param.identifierData);
    this.pdfFile = this.imageService.getEmptyOr(this.gamePanel.imageIdentifier);
    Promise.resolve().then(() => console.log((this.modalService.title = this.gamePanel.title)));
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }
}
