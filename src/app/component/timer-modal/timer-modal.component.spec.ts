import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TimerBot } from '@udonarium/timer-bot';
import { configureComponentTestingModule, createTimerBot } from '../../testing/component-testing';

import { TimerModalComponent } from './timer-modal.component';

describe('TimerModalComponent', () => {
  let component: TimerModalComponent;
  let fixture: ComponentFixture<TimerModalComponent>;
  let timerBot: TimerBot;
  let modalPanel: HTMLElement;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([TimerModalComponent]).compileComponents();
  }));

  beforeEach(() => {
    timerBot = createTimerBot();
    modalPanel = document.createElement('div');
    modalPanel.className = 'modal-panel';
    modalPanel.innerHTML = '<div class="title"><button></button></div>';
    document.body.appendChild(modalPanel);
    fixture = TestBed.createComponent(TimerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    timerBot.destroy();
    modalPanel.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
