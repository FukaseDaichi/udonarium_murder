import {
  AfterViewInit,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { LobbyComponent } from 'component/lobby/lobby.component';
import { AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { AppConfigCustomService } from 'service/app-config-custom.service';

@Component({
  selector: 'peer-menu',
  templateUrl: './peer-menu.component.html',
  styleUrls: ['./peer-menu.component.css'],
})
export class PeerMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  targetUserId: string = '';
  networkService = Network;
  gameRoomService = ObjectStore.instance;
  help: string = '';

  @Input() isViewer: boolean = false;

  get myPeer(): PeerCursor {
    return PeerCursor.myCursor;
  }

  constructor(
    private ngZone: NgZone,
    private modalService: ModalService,
    private panelService: PanelService,
    public appConfigService: AppConfigService,
    private appCustomService: AppConfigCustomService
  ) {}

  output() {
    this.appCustomService.isViewer.next(this.isViewer);
    this.appCustomService.dataViewer = this.isViewer;
    this.changeGMModeName();
  }

  ngOnInit() {
    this.isViewer = this.appCustomService.dataViewer;
    Promise.resolve().then(() => (this.panelService.title = '接続情報'));
    Promise.resolve().then(() => {
      console.log;
    });
  }

  ngAfterViewInit() {
    EventSystem.register(this).on('OPEN_NETWORK', (event) => {
      this.ngZone.run(() => {});
    });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  changeIcon() {
    this.modalService.open<string>(FileSelecterComponent).then((value) => {
      if (!this.myPeer || !value) return;
      this.myPeer.imageIdentifier = value;
    });
  }

  private resetPeerIfNeeded() {
    if (Network.peerContexts.length < 1) {
      Network.open();
      PeerCursor.myCursor.peerId = Network.peerId;
    }
  }

  private changeGMModeName() {
    if (!this.myPeer || !this.myPeer.name) {
      return;
    }

    if (this.isViewer) {
      if (this.myPeer.name.match(/^【GM】.*/)) {
        return;
      } else {
        this.myPeer.name = '【GM】' + this.myPeer.name;
      }
    } else {
      if (this.myPeer.name.match(/^【GM】.*/)) {
        this.myPeer.name = this.myPeer.name.replace('【GM】', '');
      }
    }
  }

  getUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    url.searchParams.append('id', this.networkService.peerContext.userId);
    navigator.clipboard.writeText(url.href);

    const btnDom = document.getElementById('geturlbtn');
    btnDom.classList.remove('clicked');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        btnDom.classList.add('clicked');
        btnDom.innerText = 'コピー完了';
      });
    });
  };

  connectPeer() {
    let targetUserId = this.targetUserId;
    this.targetUserId = '';
    if (targetUserId.length < 1) return;
    this.help = '';
    let context = PeerContext.create(targetUserId);
    if (context.isRoom) return;
    ObjectStore.instance.clearDeleteHistory();
    Network.connect(context.peerId);
  }

  async connectPeerHistory() {
    this.help = '';
    let conectPeers: PeerContext[] = [];
    let roomId: string = '';

    for (let peerId of this.appConfigService.peerHistory) {
      let context = PeerContext.parse(peerId);
      if (context.isRoom) {
        if (roomId !== context.roomId) conectPeers = [];
        roomId = context.roomId;
        conectPeers.push(context);
      } else {
        if (roomId !== context.roomId) conectPeers = [];
        conectPeers.push(context);
      }
    }

    if (roomId.length) {
      console.warn('connectPeerRoom <' + roomId + '>');
      let conectPeers: PeerContext[] = [];
      let peerIds = await Network.listAllPeers();
      for (let peerId of peerIds) {
        console.log(peerId);
        let context = PeerContext.parse(peerId);
        if (context.roomId === roomId) {
          conectPeers.push(context);
        }
      }
      if (conectPeers.length < 1) {
        this.help =
          '前回接続していたルームが見つかりませんでした。既に解散しているかもしれません。';
        console.warn('Room is already closed...');
        return;
      }
      Network.open(
        PeerContext.generateId(),
        conectPeers[0].roomId,
        conectPeers[0].roomName,
        conectPeers[0].password
      );
    } else {
      console.warn('connectPeers ' + conectPeers.length);
      Network.open();
    }

    PeerCursor.myCursor.peerId = Network.peerId;

    let listener = EventSystem.register(this);
    listener.on('OPEN_NETWORK', (event) => {
      console.log('OPEN_NETWORK', event.data.peerId);
      EventSystem.unregisterListener(listener);
      ObjectStore.instance.clearDeleteHistory();
      for (let context of conectPeers) {
        Network.connect(context.peerId);
      }
    });
  }

  showLobby() {
    this.modalService.open(LobbyComponent, {
      width: 700,
      height: 400,
      left: 0,
      top: 400,
    });
  }

  findUserId(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.userId : '';
  }

  findPeerName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.name : '';
  }
}
