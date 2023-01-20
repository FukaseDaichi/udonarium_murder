import { Component, OnInit } from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GamePanel } from '@udonarium/game-panel';
import { PeerCursor } from '@udonarium/peer-cursor';

@Component({
  selector: 'app-game-panel-store',
  templateUrl: './game-panel-store.component.html',
  styleUrls: ['./game-panel-store.component.css'],
})
export class GamePanelStoreComponent implements OnInit {
  getGamePanels(): GamePanel[] {
    return ObjectStore.instance.getObjects(GamePanel);
  }

  isVisible(gamePanel: GamePanel): boolean {
    return gamePanel.isAllView || gamePanel.isSelfView;
  }

  get myPeer(): PeerCursor {
    return PeerCursor.myCursor;
  }

  openPanel(event: any, gamePanel: GamePanel): void {
    const targetElement = event.currentTarget;
    targetElement.classList.remove('opened');
    targetElement.classList.remove('slide-in');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        targetElement.classList.add('opened');
      });
    });
    window.setTimeout(() => {
      gamePanel.isSelfView = true;
    }, 300);
  }

  constructor() {}

  ngOnInit(): void {
    EventSystem.register(this)
      .on('CLOSE_GAME_PANEL', (event) => {
        const closePanel: GamePanel = ObjectStore.instance.get<GamePanel>(event.data.gamePanelidentifier);
        if (closePanel) {
          // 自分で閲覧していた場合も閉じる
          closePanel.isSelfView = false;
          closePanel.isOwner = false;
        }
      })
      .on('OPEN_GAME_PANEL', (event) => {
        const gamePanemElement: HTMLElement = document.getElementById(event.data.gamePanelidentifier);
        // 先頭に持ってくる
        if (gamePanemElement) {
          let mousedownEvent = new Event('mousedown');
          gamePanemElement.dispatchEvent(mousedownEvent);
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }
}
