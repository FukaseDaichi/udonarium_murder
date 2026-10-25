import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { RoomSettingComponent } from './room-setting.component';

describe('RoomSettingComponent', () => {
  let component: RoomSettingComponent;
  let fixture: ComponentFixture<RoomSettingComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([RoomSettingComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
