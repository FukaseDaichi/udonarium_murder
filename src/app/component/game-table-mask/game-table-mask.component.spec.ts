import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameTableMask } from '@udonarium/game-table-mask';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { GameTableMaskComponent } from './game-table-mask.component';

describe('GameTableMaskComponent', () => {
  let component: GameTableMaskComponent;
  let fixture: ComponentFixture<GameTableMaskComponent>;
  let gameTableMask: GameTableMask;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([GameTableMaskComponent]).compileComponents();
  }));

  beforeEach(() => {
    gameTableMask = GameTableMask.create('マップマスク', 5, 5, 100);
    fixture = TestBed.createComponent(GameTableMaskComponent);
    component = fixture.componentInstance;
    component.gameTableMask = gameTableMask;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    gameTableMask.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
