import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DiceSymbol, DiceType } from '@udonarium/dice-symbol';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { DiceSymbolComponent } from './dice-symbol.component';

describe('DiceSymbolComponent', () => {
  let component: DiceSymbolComponent;
  let fixture: ComponentFixture<DiceSymbolComponent>;
  let diceSymbol: DiceSymbol;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([DiceSymbolComponent]).compileComponents();
  }));

  beforeEach(() => {
    diceSymbol = DiceSymbol.create('D6', DiceType.D6, 1);
    fixture = TestBed.createComponent(DiceSymbolComponent);
    component = fixture.componentInstance;
    component.diceSymbol = diceSymbol;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    diceSymbol.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
