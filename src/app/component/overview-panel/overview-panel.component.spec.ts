import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameCharacter } from '@udonarium/game-character';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { OverviewPanelComponent } from './overview-panel.component';

describe('OverviewPanelComponent', () => {
  let component: OverviewPanelComponent;
  let fixture: ComponentFixture<OverviewPanelComponent>;
  let gameCharacter: GameCharacter;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([OverviewPanelComponent]).compileComponents();
  }));

  beforeEach(() => {
    gameCharacter = GameCharacter.create('キャラクター', 1, '');
    fixture = TestBed.createComponent(OverviewPanelComponent);
    component = fixture.componentInstance;
    component.tabletopObject = gameCharacter;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    gameCharacter.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
