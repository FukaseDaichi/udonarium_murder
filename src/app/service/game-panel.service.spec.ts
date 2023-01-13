import { TestBed } from '@angular/core/testing';

import { GamePanelService } from './game-panel.service';

describe('GamePanelService', () => {
  let service: GamePanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
