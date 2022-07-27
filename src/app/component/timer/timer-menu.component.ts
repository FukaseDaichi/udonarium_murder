import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { EventSystem } from '@udonarium/core/system';
import { AppConfigService } from 'service/app-config.service';
import { PanelService } from 'service/panel.service';
import { TimerBot } from '@udonarium/timer-bot';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ModalService } from 'service/modal.service';
import { TimerModalComponent } from 'component/timer-modal/timer-modal.component';

@Component({
  selector: 'timer-menu',
  templateUrl: './timer-menu.component.html',
  styleUrls: ['./timer-menu.component.css'],
})
export class TimerMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private modalService: ModalService,
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
      this.panelService.title = '';
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  openTimerModal = (e) => {
    this.clickedAnime(e);
    EventSystem.call('TIMER_STOP', null);
    this.modalService.open<number>(TimerModalComponent).then((value) => {
      if (!value || value == 0) {
        return;
      }
      this.timerBot.time = value;
      this.timerBot.defaultTime = value;
    });
  };

  startTime = (e) => {
    this.clickedAnime(e);
    this.timerBot.startTime();
  };

  stopTime = (e) => {
    this.clickedAnime(e);
    EventSystem.call('TIMER_STOP', null);
  };

  private clickedAnime = (e) => {
    e.target.classList.remove('clicked');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        e.target.classList.add('clicked');
      });
    });
  };
}
