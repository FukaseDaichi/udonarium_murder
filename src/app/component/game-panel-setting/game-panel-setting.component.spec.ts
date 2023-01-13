import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GamePanelSettingComponent } from './game-panel-setting.component';

describe('GamePanelSettingComponent', () => {
  let component: GamePanelSettingComponent;
  let fixture: ComponentFixture<GamePanelSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GamePanelSettingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePanelSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
