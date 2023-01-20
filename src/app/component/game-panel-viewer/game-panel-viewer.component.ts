import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { EventSystem } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';

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
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.gamePanel.resize();
    }, 500);
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }
}
