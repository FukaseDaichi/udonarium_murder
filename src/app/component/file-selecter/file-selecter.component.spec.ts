import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { FileSelecterComponent } from './file-selecter.component';

describe('FileSelecterComponent', () => {
  let component: FileSelecterComponent;
  let fixture: ComponentFixture<FileSelecterComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([FileSelecterComponent]).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSelecterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
