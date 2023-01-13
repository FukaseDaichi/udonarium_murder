import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { GamePanelViewerComponent } from 'component/game-panel-viewer/game-panel-viewer.component';
import { GamePanelService } from 'service/game-panel.service';
import { ImageService } from 'service/image.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'game-panel-setting',
  templateUrl: './game-panel-setting.component.html',
  styleUrls: ['./game-panel-setting.component.css'],
})
export class GamePanelSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  minSize: number = 1;
  maxSize: number = 2000;

  get panelBackgroundImage(): ImageFile {
    return this.imageService.getEmptyOr(this.selectedPanel ? this.selectedPanel.imageIdentifier : null);
  }

  get panelDistanceviewImage(): ImageFile {
    return this.imageService.getEmptyOr(this.selectedPanel ? this.selectedPanel.backgroundImageIdentifier : null);
  }

  get panelName(): string {
    return this.selectedPanel.title;
  }
  set panelName(panelName: string) {
    if (this.isEditable) this.selectedPanel.title = panelName;
  }

  get panelWidth(): number {
    return this.selectedPanel.width;
  }
  set panelWidth(panelWidth: number) {
    if (this.isEditable) this.selectedPanel.width = panelWidth;
  }

  get panelHeight(): number {
    return this.selectedPanel.height;
  }
  set panelHeight(panelHeight: number) {
    if (this.isEditable) this.selectedPanel.height = panelHeight;
  }

  selectedPanel: GamePanel = null;
  selectedPanelXml: string = '';

  get isEmpty(): boolean {
    return this.getGamePanels().length === 0;
  }

  get isDeleted(): boolean {
    if (!this.selectedPanel) return true;
    return ObjectStore.instance.get<GamePanel>(this.selectedPanel.identifier) == null;
  }
  get isEditable(): boolean {
    return !this.isEmpty && !this.isDeleted;
  }

  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(private modalService: ModalService, private imageService: ImageService, private gamePanelService: GamePanelService, private panelService: PanelService) {}

  ngOnInit() {
    Promise.resolve().then(() => {
      this.modalService.title = this.panelService.title = 'パネル設定';
    });
    EventSystem.register(this).on('DELETE_GAME_OBJECT', 2000, (event) => {
      if (!this.selectedPanel || event.data.identifier !== this.selectedPanel.identifier) return;
      let object = ObjectStore.instance.get(event.data.identifier);
      if (object !== null) {
        this.selectedPanelXml = object.toXml();
      }
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  selectGamePanel(identifier: string) {
    EventSystem.call('SELECT_GAME_PANEL', { identifier: identifier }, Network.peerId);
    this.selectedPanel = ObjectStore.instance.get<GamePanel>(identifier);
    this.selectedPanelXml = '';
  }

  getGamePanels(): GamePanel[] {
    return ObjectStore.instance.getObjects(GamePanel);
  }

  createGamePanel() {
    let gamePanel = new GamePanel();
    gamePanel.title = '白紙のパネル';
    gamePanel.initialize();
    this.selectGamePanel(gamePanel.identifier);
    ObjectStore.instance.add(gamePanel);
  }

  openGamePanel() {
    this.gamePanelService.open(GamePanelViewerComponent, {
      param: { className: 'game-panel', identifierData: this.selectedPanel.identifier },
    });
  }

  delete() {
    if (!this.isEmpty && this.selectedPanel) {
      this.selectedPanelXml = this.selectedPanel.toXml();
      this.selectedPanel.destroy();
    }
  }

  restore() {
    if (this.selectedPanel && this.selectedPanelXml) {
      let restoreTable = ObjectSerializer.instance.parseXml(this.selectedPanelXml);
      this.selectGamePanel(restoreTable.identifier);
      this.selectedPanelXml = '';
    }
  }

  openBgImageModal() {
    if (this.isDeleted) return;
    this.modalService.open<string>(FileSelecterComponent).then((value) => {
      if (!this.selectedPanel || !value) return;
      this.selectedPanel.imageIdentifier = value;
    });
  }

  openDistanceViewImageModal() {
    if (this.isDeleted) return;
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: true }).then((value) => {
      if (!this.selectedPanel || !value) return;
      this.selectedPanel.backgroundImageIdentifier = value;
    });
  }
}
