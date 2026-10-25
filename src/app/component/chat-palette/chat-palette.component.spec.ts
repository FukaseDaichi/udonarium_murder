import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { GameCharacter } from '@udonarium/game-character';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { ChatPaletteComponent } from './chat-palette.component';

describe('ChatPaletteComponent', () => {
  let component: ChatPaletteComponent;
  let fixture: ComponentFixture<ChatPaletteComponent>;
  let chatTab: ChatTab;
  let gameCharacter: GameCharacter;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([ChatPaletteComponent, ChatInputComponent]).compileComponents();
  }));

  beforeEach(() => {
    chatTab = ChatTabList.instance.addChatTab('メインタブ');
    gameCharacter = GameCharacter.create('キャラクター', 1, '');
    fixture = TestBed.createComponent(ChatPaletteComponent);
    component = fixture.componentInstance;
    component.character = gameCharacter;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    gameCharacter.destroy();
    chatTab.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
