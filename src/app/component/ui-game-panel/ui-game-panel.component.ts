import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GamePanel } from '@udonarium/game-panel';
import { GamePanelService } from 'service/game-panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'ui-game-panel',
  templateUrl: './ui-game-panel.component.html',
  styleUrls: ['./ui-game-panel.component.css'],
  providers: [GamePanelService],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        animate('100ms ease-out', keyframes([style({ transform: 'scale(0.8, 0.8)', opacity: '0', offset: 0 }), style({ transform: 'scale(1.0, 1.0)', opacity: '1', offset: 1.0 })])),
      ]),
      transition('* => void', [animate(100, style({ transform: 'scale(0, 0)' }))]),
    ]),
  ],
})
export class UIGamePanelComponent implements OnInit {
  @ViewChild('draggablePanel', { static: true })
  draggablePanel: ElementRef<HTMLElement>;
  @ViewChild('scrollablePanel', { static: true })
  scrollablePanel: ElementRef<HTMLDivElement>;
  @ViewChild('content', { read: ViewContainerRef, static: true })
  content: ViewContainerRef;

  @Input() gamePanel: GamePanel = null;

  @Input() set title(title: string) {
    this.gamePanel.title = title;
  }
  @Input() set left(left: number) {
    this.gamePanel.left = left;
  }
  @Input() set top(top: number) {
    this.gamePanel.top = top;
  }
  @Input() set width(width: number) {
    this.gamePanel.width = width;
  }
  @Input() set height(height: number) {
    this.gamePanel.height = height;
  }
  @Input() set className(className: string) {
    this.gamePanelService.param.className = className;
  }

  @Input() showTitleButtons: boolean = true;

  get title(): string {
    return this.gamePanel.title;
  }
  get width() {
    return this.gamePanel.width;
  }
  get height() {
    return this.gamePanel.height;
  }
  get className() {
    return this.gamePanelService.param.className;
  }
  get isCenter(): boolean {
    return this.gamePanel.isCenter;
  }

  get positionStyle(): any {
    if (this.gamePanel.isCenter) {
      return { top: `calc(50% - ${this.gamePanel.height / 2}px`, left: `calc(50% - ${this.gamePanel.width / 2}px` };
    }
    return { top: this.gamePanel.top + 'px', left: this.gamePanel.left + 'px' };
  }

  private preLeft: number = 0;
  private preTop: number = 0;
  private preWidth: number = 100;
  private preHeight: number = 100;
  private isFullScreen: boolean = false;

  get isPointerDragging(): boolean {
    return this.pointerDeviceService.isDragging;
  }

  constructor(public gamePanelService: GamePanelService, private pointerDeviceService: PointerDeviceService) {}

  ngOnInit() {
    this.gamePanel = ObjectStore.instance.get<GamePanel>(this.gamePanelService.param.identifierData);
    this.gamePanelService.scrollablePanel = this.scrollablePanel.nativeElement;
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

      this.left = 0;
      this.top = 0;
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      panel.style.left = this.left + 'px';
      panel.style.top = this.top + 'px';
      panel.style.width = this.width + 'px';
      panel.style.height = this.height + 'px';
    } else {
      this.left = this.preLeft;
      this.top = this.preTop;
      this.width = this.preWidth;
      this.height = this.preHeight;
    }
  }

  close() {
    if (this.gamePanelService) this.gamePanelService.close();
  }
}
