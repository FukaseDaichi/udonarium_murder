import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TimerBot } from '@udonarium/timer-bot';
import { configureComponentTestingModule, createTimerBot } from '../../testing/component-testing';

import { TimerMenuComponent } from './timer-menu.component';

describe('TimerMenuComponent', () => {
  let component: TimerMenuComponent;
  let fixture: ComponentFixture<TimerMenuComponent>;
  let timerBot: TimerBot;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([TimerMenuComponent]).compileComponents();
  }));

  beforeEach(() => {
    timerBot = createTimerBot();
    fixture = TestBed.createComponent(TimerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    timerBot.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
