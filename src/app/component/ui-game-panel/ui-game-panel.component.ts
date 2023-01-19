import { Component, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { EventSystem } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';
import { ImageService } from 'service/image.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'ui-game-panel',
  templateUrl: './ui-game-panel.component.html',
  styleUrls: ['./ui-game-panel.component.css'],
})
export class UIGamePanelComponent implements OnInit {
  @ViewChild('draggablePanel', { static: true })
  draggablePanel: ElementRef<HTMLElement>;
  @ViewChild('scrollablePanel', { static: true })
  scrollablePanel: ElementRef<HTMLDivElement>;
  @ViewChild('content', { read: ViewContainerRef, static: true })
  content: ViewContainerRef;

  get isVisible(): boolean {
    return this.gamePanel.isAllView || this.gamePanel.isSelfView;
  }

  @Input() gamePanel: GamePanel = null;

  @Input() showTitleButtons: boolean = true;

  title: string = '';
  width: number = 1000;
  height: number = 500;

  get isCenter(): boolean {
    return this.gamePanel.isCenter;
  }

  positionStyle: any;

  get pdfFile(): ImageFile {
    return this.imageService.getEmptyOr(this.gamePanel.imageIdentifier);
  }

  private preLeft: number = 0;
  private preTop: number = 0;
  private preWidth: number = 1000;
  private preHeight: number = 500;
  private isFullScreen: boolean = false;

  get isPointerDragging(): boolean {
    return this.pointerDeviceService.isDragging;
  }

  constructor(private pointerDeviceService: PointerDeviceService, private imageService: ImageService) {}

  ngOnInit() {
    this.width = this.gamePanel.width;
    this.height = this.gamePanel.height;

    if (this.gamePanel.isCenter) {
      this.positionStyle = { top: `calc(50% - ${this.gamePanel.height / 2}px`, left: `calc(50% - ${this.gamePanel.width / 2}px` };
    } else {
      this.positionStyle = { top: this.gamePanel.top + 'px', left: this.gamePanel.left + 'px' };
    }
  }

  toggleFullScreen() {
    let panel = this.draggablePanel.nativeElement;
    if (panel.offsetLeft <= 0 && panel.offsetTop <= 0 && panel.offsetWidth >= window.innerWidth && panel.offsetHeight >= window.innerHeight) {
      this.isFullScreen = false;
    } else {
      this.isFullScreen = true;
    }

    if (this.isFullScreen) {
      this.preLeft = panel.offsetLeft;
      this.preTop = panel.offsetTop;
      this.preWidth = panel.offsetWidth;
      this.preHeight = panel.offsetHeight;

      console.log(this.preLeft + 'px と' + this.preTop);
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      panel.style.left = 0 + 'px';
      panel.style.top = 0 + 'px';
      panel.style.width = this.width + 'px';
      panel.style.height = this.height + 'px';
    } else {
      this.width = this.preWidth;
      this.height = this.preHeight;

      panel.style.left = this.preLeft + 'px';
      panel.style.top = this.preTop + 'px';
    }
  }

  close() {
    this.gamePanel.isSelfView = false;
    this.gamePanel.isOwner = false;
  }

  closeGamePanelForAllUser() {
    // オーナーではなくなる
    this.gamePanel.isOwner = false;

    // 自分のを閉じる
    this.gamePanel.isSelfView = false;
    this.gamePanel.isAllView = false;

    EventSystem.call('CLOSE_GAME_PANEL', { gamePanelidentifier: this.gamePanel.identifier });
  }
}
