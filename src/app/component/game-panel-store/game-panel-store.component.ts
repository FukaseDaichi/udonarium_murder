import { Component, OnInit } from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GamePanel } from '@udonarium/game-panel';

@Component({
  selector: 'app-game-panel-store',
  templateUrl: './game-panel-store.component.html',
  styleUrls: ['./game-panel-store.component.css'],
})
export class GamePanelStoreComponent implements OnInit {
  getGamePanels(): GamePanel[] {
    return ObjectStore.instance.getObjects(GamePanel);
  }
  constructor() {}

  ngOnInit(): void {}
}
