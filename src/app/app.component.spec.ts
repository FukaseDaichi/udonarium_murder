import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppConfigService } from 'service/app-config.service';
import { configureComponentTestingModule } from './testing/component-testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([AppComponent], {
      // 設定ファイルの読み込みを起点にネットワーク接続が始まるため、テストでは初期化処理を行わない
      providers: [{ provide: AppConfigService, useValue: { initialize: () => {} } }],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
