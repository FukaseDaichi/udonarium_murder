import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';
import { GamePanelService } from 'service/game-panel.service';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'game-panel-viewer',
  templateUrl: './game-panel-viewer.component.html',
  styleUrls: ['./game-panel-viewer.component.css'],
})
export class GamePanelViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  pdfSrc = '../assets/pdf-test.pdf';
  @Input() gamePanel: GamePanel = null;

  constructor(private modalService: ModalService, private gamePanelService: GamePanelService) {}

  toggleFullScreen() {}
  close() {
    if (this.gamePanelService) this.gamePanelService.close();
  }
  ngOnInit() {
    console.log(this.gamePanelService.param);
    this.gamePanel = ObjectStore.instance.get<GamePanel>(this.gamePanelService.param.identifierData);
    Promise.resolve().then(() => console.log((this.modalService.title = this.gamePanel.title)));
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }
}
