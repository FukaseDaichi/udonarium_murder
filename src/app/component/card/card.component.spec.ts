import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Card } from '@udonarium/card';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let card: Card;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([CardComponent]).compileComponents();
  }));

  beforeEach(() => {
    card = Card.create('カード', '', '');
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.card = card;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    card.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
