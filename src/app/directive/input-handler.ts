import { MathUtil } from '@udonarium/core/system/util/math-util';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { PointerCoordinate, PointerData } from 'service/pointer-device.service';

const MOUSE_IDENTIFIER = -9999;

interface InputHandlerOption {
  readonly capture?: boolean
  readonly passive?: boolean
  readonly always?: boolean
}

export class InputHandler {
  onStart: (ev: MouseEvent | TouchEvent) => void;
  onMove: (ev: MouseEvent | TouchEvent) => void;
  onEnd: (ev: MouseEvent | TouchEvent) => void;
  onTap: (ev: MouseEvent | TouchEvent) => void;
  onContextMenu: (ev: MouseEvent | TouchEvent) => void;

  private callbackOnMouse = this.onMouse.bind(this);
  private callbackOnTouch = this.onTouch.bind(this);
  private callbackOnMenu = this.onMenu.bind(this);

  private startTime = -1000;
  private clearLastPointerTimer = new ResettableTimeout(this.clearLastPointer.bind(this), 2000, false);

  private firstPointer: PointerData = { x: 0, y: 0, z: 0, identifier: MOUSE_IDENTIFIER }
  private lastStartPointers: PointerData[] = [];
  private lastMovePointers: PointerData[] = [];
  private primaryPointer: PointerData = { x: 0, y: 0, z: 0, identifier: MOUSE_IDENTIFIER }
  get startPointer(): PointerCoordinate { return this.firstPointer; }
  get pointer(): PointerCoordinate { return this.primaryPointer; }

  get magnitude(): number { return MathUtil.sqrMagnitude(this.firstPointer, this.primaryPointer); }

  private _isDragging: boolean = false;
  private _isGrabbing: boolean = false;
  private _isPointerMoved: boolean = false;
  get isDragging(): boolean { return this._isDragging; }
  get isGrabbing(): boolean { return this._isGrabbing; }
  get isPointerMoved(): boolean { return this._isPointerMoved; }

  private _isDestroyed: boolean = false;
  get isDestroyed(): boolean { return this._isDestroyed; }

  private readonly target: HTMLElement;
  private readonly option: InputHandlerOption;

  constructor(target: HTMLElement)
  constructor(target: HTMLElement, activate: boolean)
  constructor(target: HTMLElement, option: InputHandlerOption)
  constructor(target: HTMLElement, option: InputHandlerOption, activate: boolean)
  constructor(...args: any[]) {
    let target: HTMLElement = args[0];
    let option: InputHandlerOption = { capture: false, passive: false, always: false };
    let activate: boolean = true;

    switch (args.length) {
      case 3:
        option = args[1];
        activate = args[2];
        break;
      case 2:
        if (typeof args[1] === 'boolean') {
          activate = args[1];
        } else {
          option = args[1];
        }
        break;
    }

    this.target = target;
    this.option = {
      capture: option.capture === true,
      passive: option.passive === true,
      always: option.always === true
    };
    if (activate) this.initialize();
  }

  initialize() {
    this.target.addEventListener('mousedown', this.callbackOnMouse, this.option.capture);
    this.target.addEventListener('touchstart', this.callbackOnTouch, this.option.capture);
    if (this.option.always) this.addEventListeners();
  }

  destroy() {
    this.cancel();
    this.clearLastPointerTimer.clear();
    this._isDestroyed = true;
    this.target.removeEventListener('mousedown', this.callbackOnMouse, this.option.capture);
    this.target.removeEventListener('touchstart', this.callbackOnTouch, this.option.capture);
    this.removeEventListeners();

    this.onStart = null;
    this.onMove = null;
    this.onEnd = null;
    this.onContextMenu = null;
  }

  cancel() {
    this._isDragging = this._isGrabbing = false;
    this.clearLastPointerTimer.reset();
    if (!this.option.always) this.removeEventListeners();
  }

  private onMouse(e: MouseEvent) {
    let mosuePointer: PointerData = { x: e.pageX, y: e.pageY, z: 0, identifier: MOUSE_IDENTIFIER };
    if (this.isSyntheticEvent(e)) {
      this.updateLastPointer(e);
      return;
    }
    this.updateLastPointer(e);
    this.primaryPointer = mosuePointer;

    this.onPointer(e);
  }

  private onTouch(e: TouchEvent) {
    let length = e.changedTouches.length;
    if (length < 1) return;
    this.updateLastPointer(e);

    if (e.type === 'touchstart') {
      this.primaryPointer = this.lastStartPointers[0];
    } else {
      let changedTouches = Array.from(e.changedTouches);
      let touch = changedTouches.find(touch => touch.identifier === this.primaryPointer.identifier);
      if (touch == null) {
        let isTouchContinues = Array.from(e.touches).find(touch => touch.identifier === this.primaryPointer.identifier) != null;
        if (!isTouchContinues) {
          // タッチを追跡できなくなったら終了
          if (this.onEnd) this.onEnd(e);
          this.cancel();
        }
        return;
      }
      let touchPointer: PointerData = { x: touch.pageX, y: touch.pageY, z: 0, identifier: touch.identifier };
      this.primaryPointer = touchPointer;
    }

    this.onPointer(e);
  }

  private onPointer(e: MouseEvent | TouchEvent) {
    switch (e.type) {
      case 'mousedown':
      case 'touchstart':
        if (this.onTap) this.startTime = performance.now();
        this.clearLastPointerTimer.stop();
        this.firstPointer = this.primaryPointer;
        this._isGrabbing = true;
        this._isDragging = false;
        this._isPointerMoved = false;
        this.addEventListeners();
        if (this.onStart) this.onStart(e);
        break;
      case 'mousemove':
      case 'touchmove':
        if (this.onMove) this.onMove(e);
        this._isDragging = this._isGrabbing;
        this._isPointerMoved = this._isPointerMoved || (e instanceof MouseEvent ? 3 : 12) ** 2 < MathUtil.sqrMagnitude(this.firstPointer, this.primaryPointer);
        break;
      default:
        if (this.onEnd) this.onEnd(e);
        if (this.onTap && performance.now() - this.startTime < 250 && !this._isPointerMoved) this.onTap(e);
        this.cancel();
        break;
    }
  }

  private onMenu(e: MouseEvent | TouchEvent) {
    if (this.onContextMenu) this.onContextMenu(e);
  }

  private isSyntheticEvent(e: MouseEvent, threshold: number = 15): boolean {
    let mosuePointer: PointerData = { x: e.pageX, y: e.pageY, z: 0, identifier: MOUSE_IDENTIFIER };
    let lastPointers = this.lastMovePointers;
    if (e.type !== 'mousemove') lastPointers = lastPointers.concat(this.lastStartPointers);

    for (let pointer of lastPointers) {
      if (pointer.identifier === mosuePointer.identifier) continue;
      if (MathUtil.sqrMagnitude(mosuePointer, pointer) < threshold ** 2) {
        return true;
      }
    }
    return false;
  }

  private updateLastPointer(e: MouseEvent | TouchEvent) {
    let lastPointers: PointerData[] = [];
    if (e instanceof MouseEvent) {
      let mosuePointer: PointerData = { x: e.pageX, y: e.pageY, z: 0, identifier: MOUSE_IDENTIFIER };
      lastPointers.push(mosuePointer);
    } else {
      let length = e.touches.length;
      for (let i = 0; i < length; i++) {
        let touch = e.touches[i];
        let touchPointer: PointerData = { x: touch.pageX, y: touch.pageY, z: 0, identifier: touch.identifier };
        lastPointers.push(touchPointer);
      }
    }
    this.lastMovePointers = lastPointers;
    if (e.type === 'mousedown' || e.type === 'touchstart') this.lastStartPointers = lastPointers;
  }

  private clearLastPointer() {
    this.clearLastPointerTimer.stop();
    this.lastStartPointers = [];
    this.lastMovePointers = [];
  }

  private addEventListeners() {
    let option: AddEventListenerOptions = {
      capture: this.option.capture,
      passive: this.option.passive
    }
    this.target.ownerDocument.addEventListener('mousemove', this.callbackOnMouse, option);
    this.target.ownerDocument.addEventListener('mouseup', this.callbackOnMouse, option);
    this.target.ownerDocument.addEventListener('touchmove', this.callbackOnTouch, option);
    this.target.ownerDocument.addEventListener('touchend', this.callbackOnTouch, option);
    this.target.ownerDocument.addEventListener('touchcancel', this.callbackOnTouch, option);
    this.target.ownerDocument.addEventListener('contextmenu', this.callbackOnMenu, option);
    this.target.ownerDocument.addEventListener('drop', this.callbackOnMouse, option);
  }

  private removeEventListeners() {
    let option: EventListenerOptions = {
      capture: this.option.capture
    }
    this.target.ownerDocument.removeEventListener('mousemove', this.callbackOnMouse, option);
    this.target.ownerDocument.removeEventListener('mouseup', this.callbackOnMouse, option);
    this.target.ownerDocument.removeEventListener('touchmove', this.callbackOnTouch, option);
    this.target.ownerDocument.removeEventListener('touchend', this.callbackOnTouch, option);
    this.target.ownerDocument.removeEventListener('touchcancel', this.callbackOnTouch, option);
    this.target.ownerDocument.removeEventListener('contextmenu', this.callbackOnMenu, option);
    this.target.ownerDocument.removeEventListener('drop', this.callbackOnMouse, option);
  }
}
