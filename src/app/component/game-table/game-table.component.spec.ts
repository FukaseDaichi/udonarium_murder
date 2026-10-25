import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import 'hammerjs';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { GameTableComponent } from './game-table.component';

describe('GameTableComponent', () => {
  let component: GameTableComponent;
  let fixture: ComponentFixture<GameTableComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([GameTableComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
