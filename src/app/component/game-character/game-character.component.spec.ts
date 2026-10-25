import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameCharacter } from '@udonarium/game-character';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { GameCharacterComponent } from './game-character.component';

describe('GameCharacterComponent', () => {
  let component: GameCharacterComponent;
  let fixture: ComponentFixture<GameCharacterComponent>;
  let gameCharacter: GameCharacter;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([GameCharacterComponent]).compileComponents();
  }));

  beforeEach(() => {
    gameCharacter = GameCharacter.create('キャラクター', 1, '');
    fixture = TestBed.createComponent(GameCharacterComponent);
    component = fixture.componentInstance;
    component.gameCharacter = gameCharacter;
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
