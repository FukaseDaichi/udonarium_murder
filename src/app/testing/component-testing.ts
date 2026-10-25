import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerCursor } from '@udonarium/peer-cursor';
import { TimerBot } from '@udonarium/timer-bot';
import { SafePipe } from 'pipe/safe.pipe';
import { AppConfigCustomService } from 'service/app-config-custom.service';
import { AppConfigService } from 'service/app-config.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuService } from 'service/context-menu.service';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopService } from 'service/tabletop.service';

/**
 * AppModule と同じサービス群を提供した TestBed を構成する。
 * 子コンポーネントやディレクティブは NO_ERRORS_SCHEMA で無視し、対象コンポーネント単体を生成できるようにする。
 */
export function configureComponentTestingModule(declarations: Type<unknown>[], metadata: TestModuleMetadata = {}): TestBed {
  // アプリ起動時（AppComponent）と同様に、自分のカーソルは常に存在する前提で各コンポーネントが動作する
  if (!PeerCursor.myCursor) PeerCursor.createMyCursor();
  return TestBed.configureTestingModule({
    ...metadata,
    imports: [FormsModule, ...(metadata.imports ?? [])],
    declarations: [SafePipe, ...declarations, ...(metadata.declarations ?? [])],
    providers: [
      provideNoopAnimations(),
      AppConfigService,
      AppConfigCustomService,
      ChatMessageService,
      ContextMenuService,
      ModalService,
      GameObjectInventoryService,
      PanelService,
      PointerDeviceService,
      TabletopService,
      ...(metadata.providers ?? []),
    ],
    schemas: [NO_ERRORS_SCHEMA, ...(metadata.schemas ?? [])],
  });
}

/**
 * 固定 ID 'timer-bot' の TimerBot を生成する。
 * 破棄済みの ID は ObjectStore に再登録できないため、既存のものと削除履歴を片付けてから作り直す。
 */
export function createTimerBot(): TimerBot {
  ObjectStore.instance.get<TimerBot>('timer-bot')?.destroy();
  ObjectStore.instance.clearDeleteHistory();
  const timerBot = new TimerBot('timer-bot');
  timerBot.initialize();
  return timerBot;
}
