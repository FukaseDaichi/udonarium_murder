import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameCharacter } from '@udonarium/game-character';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { GameCharacterSheetComponent } from './game-character-sheet.component';

describe('GameCharacterSheetComponent', () => {
  let component: GameCharacterSheetComponent;
  let fixture: ComponentFixture<GameCharacterSheetComponent>;
  let gameCharacter: GameCharacter;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([GameCharacterSheetComponent]).compileComponents();
  }));

  beforeEach(() => {
    gameCharacter = GameCharacter.create('キャラクター', 1, '');
    fixture = TestBed.createComponent(GameCharacterSheetComponent);
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
