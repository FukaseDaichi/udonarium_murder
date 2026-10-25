import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { GameObjectInventoryComponent } from './game-object-inventory.component';

describe('GameObjectInventoryComponent', () => {
  let component: GameObjectInventoryComponent;
  let fixture: ComponentFixture<GameObjectInventoryComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([GameObjectInventoryComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameObjectInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
