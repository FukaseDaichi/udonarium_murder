import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CardStack } from '@udonarium/card-stack';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { CardStackComponent } from './card-stack.component';

describe('CardStackComponent', () => {
  let component: CardStackComponent;
  let fixture: ComponentFixture<CardStackComponent>;
  let cardStack: CardStack;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([CardStackComponent]).compileComponents();
  }));

  beforeEach(() => {
    cardStack = CardStack.create('山札');
    fixture = TestBed.createComponent(CardStackComponent);
    component = fixture.componentInstance;
    component.cardStack = cardStack;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    cardStack.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
