import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatMessage } from '@udonarium/chat-message';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { ChatMessageComponent } from './chat-message.component';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([ChatMessageComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.chatMessage = new ChatMessage();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
