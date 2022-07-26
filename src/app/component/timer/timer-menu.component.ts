import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { EventSystem } from '@udonarium/core/system';
import { AppConfigService } from 'service/app-config.service';
import { PanelService } from 'service/panel.service';
import { TimerBot } from '@udonarium/timer-bot';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Component({
  selector: 'timer-menu',
  templateUrl: './timer-menu.component.html',
  styleUrls: ['./timer-menu.component.css'],
})
export class TimerMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private panelService: PanelService,
    public appConfigService: AppConfigService
  ) {}

  get timerBot(): TimerBot {
    return ObjectStore.instance.get<TimerBot>('timer-bot');
  }

  get minute() {
    return ('00' + Math.floor(this.timerBot.time / 60)).slice(-2);
  }

  get second() {
    return ('00' + (this.timerBot.time % 60)).slice(-2);
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      this.panelService.title = 'タイマー';
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  setTime = () => {};

  startTime = () => {
    this.timerBot.startTime();
  };

  stopTime = () => {
    EventSystem.call('TIMER_STOP', null);
  };
}
