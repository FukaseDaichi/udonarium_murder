import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UIGamePanelComponent } from './ui-game-panel.component';

describe('UIGamePanelComponent', () => {
  let component: UIGamePanelComponent;
  let fixture: ComponentFixture<UIGamePanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UIGamePanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIGamePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
