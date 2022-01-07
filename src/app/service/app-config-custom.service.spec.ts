import { TestBed } from '@angular/core/testing';

import { AppConfigCustomService } from './app-config-custom.service';

describe('AppConfigCustomService', () => {
  let service: AppConfigCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppConfigCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
