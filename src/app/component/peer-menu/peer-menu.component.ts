import { AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { PeerSessionGrade } from '@udonarium/core/system/network/peer-session-state';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { LobbyComponent } from 'component/lobby/lobby.component';
import { RoomSettingComponent } from 'component/room-setting/room-setting.component';
import { AppConfig, AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { AppConfigCustomService } from 'service/app-config-custom.service';
import { RoomSetting } from '@udonarium/room-setting';
import { buildRoomInviteUrl } from '@udonarium/core/system/network/room-invite';

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
  isPasswordVisible = false;
  isUrlCopied = false;

  @Input() isViewer: boolean = false;

  roomSetting: RoomSetting;

  get isChatWindowAble(): boolean {
    return this.roomSetting.chatWindowAuthority;
  }
  set isChatWindowAble(checkbox: boolean) {
    this.roomSetting.chatWindowAuthority = checkbox;
  }
  get isGameTableSettingAble(): boolean {
    return this.roomSetting.gameTableSettingAuthority;
  }
  set isGameTableSettingAble(checkbox: boolean) {
    this.roomSetting.gameTableSettingAuthority = checkbox;
  }
  get isFileStorageAble(): boolean {
    return this.roomSetting.fileStorageAuthority;
  }
  set isFileStorageAble(checkbox: boolean) {
    this.roomSetting.fileStorageAuthority = checkbox;
  }

  get isJukeboxAble(): boolean {
    return this.roomSetting.jukeboxAuthority;
  }
  set isJukeboxAble(checkbox: boolean) {
    this.roomSetting.jukeboxAuthority = checkbox;
  }
  get isGameObjectInventoryAble(): boolean {
    return this.roomSetting.gameObjectInventoryAuthority;
  }
  set isGameObjectInventoryAble(checkbox: boolean) {
    this.roomSetting.gameObjectInventoryAuthority = checkbox;
  }
  get isFileSelectAble(): boolean {
    return this.roomSetting.fileSelectAuthority;
  }
  set isFileSelectAble(checkbox: boolean) {
    this.roomSetting.fileSelectAuthority = checkbox;
  }

  get isFileSaveAble(): boolean {
    return this.roomSetting.fileSaveAuthority;
  }
  set isFileSaveAble(checkbox: boolean) {
    this.roomSetting.fileSaveAuthority = checkbox;
  }

  get isTimerAble(): boolean {
    return this.roomSetting.timerAuthority;
  }
  set isTimerAble(checkbox: boolean) {
    this.roomSetting.timerAuthority = checkbox;
  }

  get isGamePanelSettingAble(): boolean {
    return this.roomSetting.gamePanelSettingAuthority;
  }

  set isGamePanelSettingAble(checkbox: boolean) {
    this.roomSetting.gamePanelSettingAuthority = checkbox;
  }
  private interval: NodeJS.Timeout;

  get myPeer(): PeerCursor {
    return PeerCursor.myCursor;
  }

  get config(): AppConfig {
    return AppConfigService.appConfig;
  }

  get canUsePrivateSession(): boolean {
    return this.config.backend.mode === 'skyway';
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
    this.roomSetting = ObjectStore.instance.get<RoomSetting>('room-setting');
    Promise.resolve().then(() => (this.panelService.title = '接続情報'));
  }

  ngAfterViewInit() {
    EventSystem.register(this).on('OPEN_NETWORK', (event) => {
      this.ngZone.run(() => {});
    });
    this.interval = setInterval(() => {}, 1000);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    clearInterval(this.interval);
  }

  changeIcon() {
    this.modalService.open<string>(FileSelecterComponent).then((value) => {
      if (!this.myPeer || !value) return;
      this.myPeer.imageIdentifier = value;
    });
  }

  private resetPeerIfNeeded() {
    if (Network.peers.length < 1) {
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

  // ルームに入室中なら、合言葉込みの「参加用URL」を生成する（同じ部屋に入り直せる）
  get inviteUrl(): string {
    const peer = this.networkService.peer;
    if (!peer || !peer.isRoom) return '';
    return buildRoomInviteUrl({ r: peer.roomId, n: peer.roomName, p: peer.password });
  }

  get canShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  copyInviteUrl() {
    const url = this.inviteUrl;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.ngZone.run(() => (this.isUrlCopied = true));
      setTimeout(() => this.ngZone.run(() => (this.isUrlCopied = false)), 2000);
    });
  }

  shareInviteUrl() {
    const url = this.inviteUrl;
    if (!url || !this.canShare) return;
    navigator.share({ title: 'ユドナリウム マーダー', text: 'ルームへの招待です。URLを開くと参加できます。', url }).catch(() => {});
  }

  // GM向け: ルーム作成モーダルを直接開く（ロビーを経由しない）
  createRoom() {
    this.modalService.open(RoomSettingComponent, { width: 700, height: 400, left: 0, top: 400 });
  }

  connectPeer() {
    let targetUserId = this.targetUserId;
    this.targetUserId = '';
    if (targetUserId.length < 1) return;
    this.help = '';
    let peer = PeerContext.create(targetUserId);
    if (peer.isRoom) return;
    ObjectStore.instance.clearDeleteHistory();
    Network.connect(peer);
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
        this.help = '前回接続していたルームが見つかりませんでした。既に解散しているかもしれません。';
        console.warn('Room is already closed...');
        return;
      }
      Network.open(PeerContext.generateId(), conectPeers[0].roomId, conectPeers[0].roomName, conectPeers[0].password);
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
        Network.connect(context);
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

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  stringFromSessionGrade(grade: PeerSessionGrade): string {
    return PeerSessionGrade[grade] ?? PeerSessionGrade[PeerSessionGrade.UNSPECIFIED];
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
