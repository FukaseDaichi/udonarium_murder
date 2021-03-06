import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimerMenuComponent } from './timer-menu.component';

describe('TimerMenuComponent', () => {
  let component: TimerMenuComponent;
  let fixture: ComponentFixture<TimerMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TimerMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
