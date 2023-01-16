import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { EventSystem } from './core/system';

@SyncObject('game-panel')
export class GamePanel extends ObjectNode {
  @SyncVar() title: string = 'パネル';
  @SyncVar() width: number = 1000;
  @SyncVar() height: number = 500;
  @SyncVar() top: number = 100;
  @SyncVar() left: number = 50;
  @SyncVar() imageIdentifier: string = 'imageIdentifier';
  @SyncVar() backgroundImageIdentifier: string = 'imageIdentifier';
  @SyncVar() selected: boolean = false;
  @SyncVar() isView: boolean = false;
  @SyncVar() isCenter: boolean = true;

  onStoreAdded() {
    super.onStoreAdded();
    if (this.selected) EventSystem.trigger('SELECT_GAME_PANEL', { identifier: this.identifier });
  }

  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }
}
