import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CardStack } from '@udonarium/card-stack';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { CardStackListComponent } from './card-stack-list.component';

describe('CardStackListComponent', () => {
  let component: CardStackListComponent;
  let fixture: ComponentFixture<CardStackListComponent>;
  let cardStack: CardStack;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([CardStackListComponent]).compileComponents();
  }));

  beforeEach(() => {
    cardStack = CardStack.create('山札');
    fixture = TestBed.createComponent(CardStackListComponent);
    component = fixture.componentInstance;
    component.cardStack = cardStack;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    cardStack.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
