import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';
import { GamePanel } from './game-panel';

@SyncObject('GamePanelSelecter')
export class GamePanelSelecter extends GameObject {
  private static _instance: GamePanelSelecter;
  static get instance(): GamePanelSelecter {
    if (!GamePanelSelecter._instance) {
      GamePanelSelecter._instance = new GamePanelSelecter('GamePanelSelecter');
      GamePanelSelecter._instance.initialize();
    }
    return GamePanelSelecter._instance;
  }

  @SyncVar() selectPanelIdentifier: string = '';

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this).on('SELECT_GAME_PANEL', (event) => {
      if (this.selectedPanel) this.selectedPanel.selected = false;
      this.selectPanelIdentifier = event.data.identifier;
      if (this.selectedPanel) this.selectedPanel.selected = true;
    });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  get selectedPanel(): GamePanel {
    let panel: GamePanel = ObjectStore.instance.get<GamePanel>(this.selectPanelIdentifier);
    if (!panel) {
      panel = ObjectStore.instance.getObjects<GamePanel>(GamePanel)[0];
      if (panel && (this.selectPanelIdentifier.length < 1 || ObjectStore.instance.isDeleted(this.selectPanelIdentifier))) {
        this.selectPanelIdentifier = panel.identifier;
        EventSystem.trigger('SELECT_GAME_PANEL', { identifier: panel.identifier });
      }
    }
    return panel;
  }
}
