import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { JukeboxComponent } from './jukebox.component';

describe('JukeboxComponent', () => {
  let component: JukeboxComponent;
  let fixture: ComponentFixture<JukeboxComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([JukeboxComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JukeboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
