import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalService } from 'service/modal.service';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { PasswordCheckComponent } from './password-check.component';

describe('PasswordCheckComponent', () => {
  let component: PasswordCheckComponent;
  let fixture: ComponentFixture<PasswordCheckComponent>;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([PasswordCheckComponent], {
      providers: [{ provide: ModalService, useValue: { option: { peers: [], title: 'テストルーム' }, title: '' } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
