import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatTab } from '@udonarium/chat-tab';
import { PanelService } from 'service/panel.service';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { ChatTabComponent } from './chat-tab.component';

describe('ChatTabComponent', () => {
  let component: ChatTabComponent;
  let fixture: ComponentFixture<ChatTabComponent>;
  let chatTab: ChatTab;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([ChatTabComponent]).compileComponents();
  }));

  beforeEach(() => {
    chatTab = new ChatTab();
    chatTab.initialize();
    TestBed.inject(PanelService).scrollablePanel = document.createElement('div');
    fixture = TestBed.createComponent(ChatTabComponent);
    component = fixture.componentInstance;
    component.chatTab = chatTab;
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
