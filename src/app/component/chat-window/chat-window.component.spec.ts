import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { ChatWindowComponent } from './chat-window.component';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;
  let chatTab: ChatTab;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([ChatWindowComponent]).compileComponents();
  }));

  beforeEach(() => {
    chatTab = ChatTabList.instance.addChatTab('メインタブ');
    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    chatTab.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
