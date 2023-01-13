import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePanelViewerComponent } from './game-panel-viewer.component';

describe('GamePanelViewerComponent', () => {
  let component: GamePanelViewerComponent;
  let fixture: ComponentFixture<GamePanelViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamePanelViewerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePanelViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
