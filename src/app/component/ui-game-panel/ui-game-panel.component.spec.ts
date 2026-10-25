import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GamePanel } from '@udonarium/game-panel';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { UIGamePanelComponent } from './ui-game-panel.component';

describe('UIGamePanelComponent', () => {
  let component: UIGamePanelComponent;
  let fixture: ComponentFixture<UIGamePanelComponent>;
  let gamePanel: GamePanel;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([UIGamePanelComponent]).compileComponents();
  }));

  beforeEach(() => {
    gamePanel = new GamePanel();
    gamePanel.initialize();
    fixture = TestBed.createComponent(UIGamePanelComponent);
    component = fixture.componentInstance;
    component.gamePanel = gamePanel;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    gamePanel.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
