import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';
import { AudioStorage } from './core/file-storage/audio-storage';
import { timer, Subscription } from 'rxjs';
import { PresetSound } from '@udonarium/sound-effect';
import { AudioPlayer, VolumeType } from './core/file-storage/audio-player';

@SyncObject('timer-bot')
export class TimerBot extends GameObject {
  subscription: Subscription;
  @SyncVar() time: number = 600;
  @SyncVar() isStart: boolean = false;
  @SyncVar() defaultTime: number = 600;

  private audioPlayer: AudioPlayer = new AudioPlayer();

  onStoreAdded() {
    super.onStoreAdded();

    EventSystem.register(this)
      .on('TIMER_STOP', () => {
        this.stopTime();
      })
      .on('TIMER_ALERM', () => {
        this.audioPlayer.volumeType = VolumeType.AUDITION;
        this.audioPlayer.play(AudioStorage.instance.get(PresetSound.alerm));
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
        this.endTime();
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
    EventSystem.call('TIMER_ALERM', null);
    EventSystem.call('TIMER_STOP', null);
    this.time = this.defaultTime;
  };
}
