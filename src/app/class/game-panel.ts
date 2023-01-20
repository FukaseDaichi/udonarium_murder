import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { EventSystem } from './core/system';

const SHORTCUT_LIMIT_TITLE_LENGTH: number = 5;

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
  @SyncVar() isAllView: boolean = false;
  @SyncVar() isCenter: boolean = true;
  @SyncVar() isShortcutAble: boolean = true;
  @SyncVar() nicknameFillter: string = '';
  @SyncVar() isOriginalSize: boolean = true;

  isSelfView: boolean = false;
  isOwner: boolean = false;

  shortCutName(): string {
    if (!this.title) {
      return '名無し';
    }

    if (this.title.length <= SHORTCUT_LIMIT_TITLE_LENGTH) {
      return this.title;
    }

    return this.title.slice(0, SHORTCUT_LIMIT_TITLE_LENGTH);
  }

  isShortcutView(nickname: string): boolean {
    // 既に見えている場合
    if (this.isAllView || this.isSelfView) return false;

    // 権限なし
    if (!this.isShortcutAble) return false;

    //フィルターなし
    if (!this.nicknameFillter) return true;

    //以下フィルターあり
    nickname = nickname.replace('＠', '@');
    const filterArray: string[] = this.nicknameFillter.split(',');

    let matchCont = 0;

    filterArray.forEach((element) => {
      if (element) {
        if (nickname.indexOf(element.replace('＠', '@')) >= 0) {
          matchCont++;
        }
      }
    });

    if (matchCont > 0) {
      return true;
    }
    return false;
  }

  resize(): void {
    if (this.isOriginalSize) return;
    const e = new Event('resize');
    window.dispatchEvent(e);
  }

  onStoreAdded() {
    super.onStoreAdded();
    if (this.selected) EventSystem.trigger('SELECT_GAME_PANEL', { identifier: this.identifier });
  }

  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }
}
