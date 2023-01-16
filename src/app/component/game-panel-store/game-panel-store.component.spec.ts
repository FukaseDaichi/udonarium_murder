import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePanelStoreComponent } from './game-panel-store.component';

describe('GamePanelStoreComponent', () => {
  let component: GamePanelStoreComponent;
  let fixture: ComponentFixture<GamePanelStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePanelStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePanelStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
