import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Input,
} from '@angular/core';

import { EventSystem } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { TimerBot } from '@udonarium/timer-bot';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'timer-modal',
  templateUrl: './timer-modal.component.html',
  styleUrls: ['./timer-modal.component.css'],
})
export class TimerModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isAllowedEmpty: boolean = false;

  get minute() {
    return Math.floor(this.timerBot.time / 60);
  }

  get second() {
    return this.timerBot.time % 60;
  }

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) {
    this.isAllowedEmpty =
      this.modalService.option && this.modalService.option.isAllowedEmpty
        ? true
        : false;
  }

  get timerBot(): TimerBot {
    return ObjectStore.instance.get<TimerBot>('timer-bot');
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      this.modalService.title = 'タイマー設定';
      this.panelService.title = 'タイマー設定';
      const modalElm: HTMLElement = document.querySelector('.modal-panel');
      modalElm.style.width = '380px';
      modalElm.style.background = 'rgba(44,44,44,0.8)';

      const modalTitleElm: HTMLElement = document.querySelector(
        '.modal-panel .title'
      );
      modalTitleElm.style.background = 'rgba(44,44,44,0.8)';
      modalTitleElm.style.color = 'rgba(255,255,255,0.8)';

      const modalTitleButtonElm: HTMLElement = document.querySelector(
        '.modal-panel .title button'
      );
      modalTitleButtonElm.style.color = 'rgba(255,255,255,0.8)';
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  setTime = (value: number) => {
    if (value !== 0) {
      this.modalService.resolve(value);
      return;
    }
    const minElm: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('minute-input')
    );
    const secElm: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('second-input')
    );
    try {
      const time = Number(minElm.value) * 60 + Number(secElm.value);
      this.modalService.resolve(time);
    } catch (e) {
      this.modalService.resolve(0);
    }
  };
}
