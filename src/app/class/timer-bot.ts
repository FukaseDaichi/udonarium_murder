import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';
import { Subject, timer, Subscription } from 'rxjs';

@SyncObject('timer-bot')
export class TimerBot extends GameObject {
  subscription: Subscription;
  @SyncVar() time: number = 600;
  @SyncVar() isStart: boolean = false;

  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this).on('TIMER_STOP', () => {
      this.stopTime();
    });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  public startTime = () => {
    if (this.isStart || this.time <= 0) {
      return;
    }
    console.log('開始');
    this.isStart = true;
    this.subscription = timer(1000, 1000).subscribe((value) => {
      this.time = this.time - 1;
      if (this.time <= 0) {
        this.stopTime();
      }
    });
  };

  public stopTime = () => {
    console.log('停止');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.isStart = false;
  };

  public endTime = () => {
    EventSystem.call('TIMER_STOP', null);
  };
}
