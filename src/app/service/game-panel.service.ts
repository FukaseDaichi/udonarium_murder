import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';

declare var Type: FunctionConstructor;
interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface GamePanelOption {
  param: any;
}

@Injectable()
export class GamePanelService {
  static defaultParentViewContainerRef: ViewContainerRef;
  static UIGamePanelComponentClass: { new (...args: any[]): any } = null;

  private panelComponentRef: ComponentRef<any>;
  position: any = {};
  param: any = {};

  scrollablePanel: HTMLDivElement = null;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  get isShow(): boolean {
    return this.panelComponentRef ? true : false;
  }

  open<T>(childComponent: Type<T>, option?: GamePanelOption, parentViewContainerRef?: ViewContainerRef): T {
    if (!parentViewContainerRef) {
      parentViewContainerRef = GamePanelService.defaultParentViewContainerRef;
    }
    let panelComponentRef: ComponentRef<any>;

    const injector = parentViewContainerRef.injector;

    const panelComponentFactory = this.componentFactoryResolver.resolveComponentFactory(GamePanelService.UIGamePanelComponentClass);
    const bodyComponentFactory = this.componentFactoryResolver.resolveComponentFactory(childComponent);

    panelComponentRef = parentViewContainerRef.createComponent(panelComponentFactory, parentViewContainerRef.length, injector);
    let bodyComponentRef: ComponentRef<any> = panelComponentRef.instance.content.createComponent(bodyComponentFactory);

    const childPanelService: GamePanelService = panelComponentRef.injector.get(GamePanelService);

    childPanelService.panelComponentRef = panelComponentRef;
    if (option) {
      if (option.param) childPanelService.param = option.param;
    }
    panelComponentRef.onDestroy(() => {
      childPanelService.panelComponentRef = null;
    });

    return <T>bodyComponentRef.instance;
  }

  close() {
    if (this.panelComponentRef) {
      this.panelComponentRef.destroy();
      this.panelComponentRef = null;
    }
  }
}
