import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';
import { AudioStorage } from './core/file-storage/audio-storage';
import { timer, Subscription } from 'rxjs';
import { AudioPlayer, VolumeType } from './core/file-storage/audio-player';

interface alermFile {
  path: string;
  name: string;
}

export class AlermSound {
  static alermFileList: alermFile[] = [
    { path: './assets/sounds/alerm/alerm.mp3', name: 'アラート' },
    { path: './assets/sounds/alerm/voice_ariel.wav', name: 'CoeFont_アリエル' },
    {
      path: './assets/sounds/alerm/voice_mirial.wav',
      name: 'CoeFont_ミリアル',
    },
    { path: './assets/sounds/alerm/bell.mp3', name: '鐘の音' },
    { path: './assets/sounds/alerm/school.mp3', name: '学校のチャイム' },
    { path: './assets/sounds/alerm/chaim.mp3', name: 'ホラーチャイム' },
  ];
}

@SyncObject('timer-bot')
export class TimerBot extends GameObject {
  subscription: Subscription;
  @SyncVar() alerm: string = AlermSound.alermFileList[0].path;
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
      .on('TIMER_ALERM', (value) => {
        this.audioPlayer.volumeType = VolumeType.AUDITION;
        this.audioPlayer.play(AudioStorage.instance.get(value.data));
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
    EventSystem.call('TIMER_ALERM', this.alerm);
    EventSystem.call('TIMER_STOP', null);
    this.time = this.defaultTime;
  };
}
